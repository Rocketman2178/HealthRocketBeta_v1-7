import React from "react";
import { useSupabase } from "../../contexts/SupabaseContext";
import { OnboardingService } from "../../lib/onboarding/OnboardingService";
import { MissionIntro } from "./steps/MissionIntro";
import { HealthIntro } from "./steps/HealthIntro";
import {
  GameBasicsStep,
  HealthCategoriesStep,
  LaunchStep,
} from "./steps/GuidanceSteps";
import { CommunitySelect } from "./steps/CommunitySelect";
import { HealthUpdate } from "./steps/HealthUpdate";
import { Logo } from "../ui/logo";
import { supabase } from "../../lib/supabase";
import { useUser } from "../../hooks/useUser";
export function OnboardingFlow() {
  const { user } = useSupabase();
  const { userData, userLoading, fetchUser } = useUser(user?.id);
  const [isNavigating, setIsNavigating] = React.useState(false);
  const handleLaunch = async () => {
    if (!user || isNavigating) return;
    setIsNavigating(true);
    try {
      await OnboardingService.completeOnboarding(user.id);
    } catch (err) {
      console.error("Error completing onboarding:", err);
      setIsNavigating(false);
      // Reset loading state on error
      // Show error state if needed
    }
  };
  const handleOnboardingstep = async (step: string) => {
    if (!user?.id) return;
    const { error } = await supabase
      .from("users")
      .update({ onboarding_step: step })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating onboarding step:", error.message);
      return;
    }
    await fetchUser();
  };
  const renderStep = () => {
    switch (userData?.onboarding_step) {
      case "mission":
        return (
          <MissionIntro onAccept={() => handleOnboardingstep("community")} />
        );
      case "community":
        return (
          <CommunitySelect
            onContinue={() => handleOnboardingstep("health-intro")}
          />
        );
      case "health-intro":
        return (
          <HealthIntro
            onContinue={() => handleOnboardingstep("health-assessment")}
          />
        );
      case "health-assessment":
        return (
          <HealthUpdate
            onComplete={() => handleOnboardingstep("game-basics")}
          />
        );
      case "game-basics":
        return (
          <GameBasicsStep
            onContinue={() => handleOnboardingstep("health-categories")}
          />
        );
      case "health-categories":
        return (
          <HealthCategoriesStep
            onContinue={() => handleOnboardingstep("launch")}
          />
        );
      case "launch":
        return (
          <LaunchStep onContinue={handleLaunch} isLoading={isNavigating} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?auto=format&fit=crop&q=80")',
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>
      <div className="relative z-10 w-full max-w-[480px] pt-12 mb-8">
        <Logo />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="relative z-10 mt-0">
          {userLoading ? (
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            renderStep()
          )}
        </div>
      </div>
    </div>
  );
}
