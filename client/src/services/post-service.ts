// Post Service - Handles all post-related operations
// Extracted from supabase-data.ts for better modularity

import { supabase } from "./supabase";
import { logServiceError } from "../lib/logger";
import { handleSupabaseError } from "../lib/error-handler";
import { Post, Comment, PostWithAuthor, CommentWithAuthor } from "../types";

export interface CreatePostData {
  content: string;
  authorId: string;
  familyId: string;
  hasImage?: boolean;
  imageUrl?: string;
}

export interface CreateCommentData {
  content: string;
  authorId: string;
  postId: string;
}

export interface UpdatePostData {
  content?: string;
  hasImage?: boolean;
  imageUrl?: string;
}

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export class PostService {
  /**
   * Get posts for a family with pagination
   */
  async getFamilyPosts(
    familyId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<ServiceResponse<PostWithAuthor[]>> {
    try {
      const offset = (page - 1) * limit;

      const { data: posts, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          author:users(id, name, avatar, initials)
        `,
        )
        .eq("familyId", familyId)
        .order("createdAt", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const postsWithAuthor =
        posts?.map((post) => ({
          ...post,
          author: post.author,
        })) || [];

      return {
        data: postsWithAuthor,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "PostService",
        action: "getFamilyPosts",
        familyId,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Get post by ID with author and comments
   */
  async getPostById(postId: string): Promise<ServiceResponse<PostWithAuthor>> {
    try {
      const { data: post, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          author:users(id, name, avatar, initials)
        `,
        )
        .eq("id", postId)
        .single();

      if (error) throw error;

      const postWithAuthor = {
        ...post,
        author: post.author,
      };

      return {
        data: postWithAuthor,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "PostService",
        action: "getPostById",
        postId,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Create a new post
   */
  async createPost(postData: CreatePostData): Promise<ServiceResponse<Post>> {
    try {
      const { data: post, error } = await supabase
        .from("posts")
        .insert({
          ...postData,
          hasImage: postData.hasImage || false,
          imageUrl: postData.imageUrl || null,
          likes: 0,
          comments: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data: post,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "PostService",
        action: "createPost",
        authorId: postData.authorId,
        familyId: postData.familyId,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Update a post
   */
  async updatePost(
    postId: string,
    updates: UpdatePostData,
  ): Promise<ServiceResponse<Post>> {
    try {
      const { data: post, error } = await supabase
        .from("posts")
        .update({
          ...updates,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", postId)
        .select()
        .single();

      if (error) throw error;

      return {
        data: post,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "PostService",
        action: "updatePost",
        postId,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Delete a post
   */
  async deletePost(postId: string): Promise<ServiceResponse<void>> {
    try {
      // First delete all comments for this post
      const { error: commentsError } = await supabase
        .from("comments")
        .delete()
        .eq("postId", postId);

      if (commentsError) throw commentsError;

      // Then delete the post
      const { error: postError } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (postError) throw postError;

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "PostService",
        action: "deletePost",
        postId,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Like/unlike a post
   */
  async togglePostLike(
    postId: string,
    userId: string,
  ): Promise<ServiceResponse<{ liked: boolean }>> {
    try {
      // Check if user already liked the post
      const { data: existingLike, error: checkError } = await supabase
        .from("post_likes")
        .select("id")
        .eq("postId", postId)
        .eq("userId", userId)
        .single();

      if (checkError && checkError.code !== "PGRST116") throw checkError;

      if (existingLike) {
        // Unlike the post
        const { error: unlikeError } = await supabase
          .from("post_likes")
          .delete()
          .eq("id", existingLike.id);

        if (unlikeError) throw unlikeError;

        // Decrease like count
        await this.updatePostLikeCount(postId, -1);

        return {
          data: { liked: false },
          error: null,
          success: true,
        };
      } else {
        // Like the post
        const { error: likeError } = await supabase.from("post_likes").insert({
          postId,
          userId,
          createdAt: new Date().toISOString(),
        });

        if (likeError) throw likeError;

        // Increase like count
        await this.updatePostLikeCount(postId, 1);

        return {
          data: { liked: true },
          error: null,
          success: true,
        };
      }
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "PostService",
        action: "togglePostLike",
        postId,
        userId,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Update post like count
   */
  private async updatePostLikeCount(
    postId: string,
    change: number,
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc("update_post_like_count", {
        post_id: postId,
        like_change: change,
      });

      if (error) throw error;
    } catch (error) {
      logServiceError("PostService", "updatePostLikeCount", error as Error, {
        postId,
        change,
      });
    }
  }

  /**
   * Get comments for a post
   */
  async getPostComments(
    postId: string,
  ): Promise<ServiceResponse<CommentWithAuthor[]>> {
    try {
      const { data: comments, error } = await supabase
        .from("comments")
        .select(
          `
          *,
          author:users(id, name, avatar)
        `,
        )
        .eq("postId", postId)
        .order("createdAt", { ascending: true });

      if (error) throw error;

      const commentsWithAuthor =
        comments?.map((comment) => ({
          ...comment,
          author: comment.author,
        })) || [];

      return {
        data: commentsWithAuthor,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "PostService",
        action: "getPostComments",
        postId,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Add comment to a post
   */
  async addComment(
    commentData: CreateCommentData,
  ): Promise<ServiceResponse<Comment>> {
    try {
      const { data: comment, error } = await supabase
        .from("comments")
        .insert({
          ...commentData,
          createdAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update post comment count
      await this.updatePostCommentCount(commentData.postId, 1);

      return {
        data: comment,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "PostService",
        action: "addComment",
        postId: commentData.postId,
        authorId: commentData.authorId,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(
    commentId: string,
    postId: string,
  ): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      // Update post comment count
      await this.updatePostCommentCount(postId, -1);

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "PostService",
        action: "deleteComment",
        commentId,
        postId,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Update post comment count
   */
  private async updatePostCommentCount(
    postId: string,
    change: number,
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc("update_post_comment_count", {
        post_id: postId,
        comment_change: change,
      });

      if (error) throw error;
    } catch (error) {
      logServiceError("PostService", "updatePostCommentCount", error as Error, {
        postId,
        change,
      });
    }
  }

  /**
   * Search posts by content
   */
  async searchPosts(
    query: string,
    familyId: string,
  ): Promise<ServiceResponse<PostWithAuthor[]>> {
    try {
      const { data: posts, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          author:users(id, name, avatar, initials)
        `,
        )
        .eq("familyId", familyId)
        .ilike("content", `%${query}%`)
        .order("createdAt", { ascending: false })
        .limit(20);

      if (error) throw error;

      const postsWithAuthor =
        posts?.map((post) => ({
          ...post,
          author: post.author,
        })) || [];

      return {
        data: postsWithAuthor,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "PostService",
        action: "searchPosts",
        familyId,
        query,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Get user's posts
   */
  async getUserPosts(
    userId: string,
    familyId?: string,
  ): Promise<ServiceResponse<PostWithAuthor[]>> {
    try {
      let query = supabase
        .from("posts")
        .select(
          `
          *,
          author:users(id, name, avatar, initials)
        `,
        )
        .eq("authorId", userId)
        .order("createdAt", { ascending: false });

      if (familyId) {
        query = query.eq("familyId", familyId);
      }

      const { data: posts, error } = await query;

      if (error) throw error;

      const postsWithAuthor =
        posts?.map((post) => ({
          ...post,
          author: post.author,
        })) || [];

      return {
        data: postsWithAuthor,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "PostService",
        action: "getUserPosts",
        userId,
        familyId,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }
}

// Export singleton instance
export const postService = new PostService();
