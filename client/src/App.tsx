import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LiveKitProvider } from "./contexts/LiveKitContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { Profile } from "./pages/Profile";
import { BirthdayDetails } from "./pages/BirthdayDetails";
import { EventDetails } from "./pages/EventDetails";
import { About } from "./pages/About";
import { Welcome } from "./pages/Welcome";
import { JoinFamily } from "./pages/JoinFamily";
import { CreateFamily } from "./pages/CreateFamily";
import { Signup } from "./pages/Signup";
import { WelcomeAboard } from "./pages/WelcomeAboard";
import { Subscription } from "./pages/Subscription";
import FamilyManagement from "./pages/FamilyManagement";
import Recipes from "./pages/Recipes";
import Polls from "./pages/Polls";
import Photos from "./pages/Photos";
import { Playlists } from "./pages/Playlists";
import { Chat } from "./pages/Chat";
import { ViewRecipe } from "./pages/ViewRecipe";
import FamilyContacts from "./pages/FamilyContacts";
import { Milestones } from "./pages/Milestones";
import Games from "./pages/Games";
import { FamilyHistory } from "./pages/FamilyHistory";
import HealthHistory from "./pages/HealthHistory";
import Fitness from "./pages/Fitness";
import { Resources } from "./pages/Resources";
import { SubmitVendor } from "./pages/SubmitVendor";
import FamilyMission from "./pages/FamilyMission";
import { Kynnect } from "./pages/Kynnect";
import { KynnectRoom } from "./pages/KynnectRoom";
import { Media } from "./pages/Media";
import Events from "./pages/Events";
import { TermsAndConditions } from "./pages/TermsAndConditions";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";

function App() {
  return (
    <LiveKitProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* Onboarding Flow */}
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/join-family" element={<JoinFamily />} />
          <Route path="/create-family" element={<CreateFamily />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/welcome-aboard" element={<WelcomeAboard />} />

          {/* About Page */}
          <Route path="/about" element={<About />} />

          {/* Legal Pages */}
          <Route
            path="/terms-and-conditions"
            element={<TermsAndConditions />}
          />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          {/* Subscription Management */}
          <Route path="/subscription" element={<Subscription />} />

          {/* Family Management (Admin) */}
          <Route path="/family-management" element={<FamilyManagement />} />

          {/* Chat */}
          <Route path="/chat/:memberId" element={<Chat />} />

          {/* Recipe Detail */}
          <Route path="/recipe/:recipeId" element={<ViewRecipe />} />

          {/* Birthday and Event Detail Pages */}
          <Route path="/birthday/:day" element={<BirthdayDetails />} />
          <Route path="/event/:day" element={<EventDetails />} />

          {/* Profile and Family Routes */}
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/profile/:member"
            element={<PlaceholderPage title="Family Member Profile" />}
          />
          <Route path="/contacts" element={<FamilyContacts />} />
          <Route
            path="/family/:member"
            element={<PlaceholderPage title="Family Member" />}
          />

          {/* Main Navigation Routes */}
          <Route path="/events" element={<Events />} />
          <Route path="/media" element={<Media />} />
          <Route path="/polls" element={<Polls />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/games" element={<Games />} />
          <Route path="/milestones" element={<Milestones />} />
          <Route path="/history" element={<FamilyHistory />} />
          <Route path="/photos" element={<Photos />} />
          <Route path="/health" element={<HealthHistory />} />
          <Route path="/fitness" element={<Fitness />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/submit-vendor" element={<SubmitVendor />} />
          <Route path="/mission" element={<FamilyMission />} />
          <Route path="/kynnect" element={<Kynnect />} />
          <Route path="/kynnect/room/:roomId" element={<KynnectRoom />} />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </LiveKitProvider>
  );
}

export default App;
