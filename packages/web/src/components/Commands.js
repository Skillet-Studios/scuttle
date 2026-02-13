import { useState } from "react";
import EnableDemo from "../assets/enable_demo.gif";
import StatsDailyDemo from "../assets/stats_demo.gif";
import StatsWeeklyDemo from "../assets/stats_weekly_demo.gif";
import StatsMonthlyDemo from "../assets/stats_monthly_demo.gif";
import ReportsWeeklyDemo from "../assets/report_demo.gif";
import ReportsMonthlyDemo from "../assets/report_monthly_demo.gif";
import SummonersDemo from "../assets/summoners_demo.gif";
import SummonersAddDemo from "../assets/summoners_add_demo.gif";
import SummonersRemoveDemo from "../assets/summoners_remove.gif";
import HelpDemo from "../assets/help.gif";
import SupportDemo from "../assets/support.gif";

const commands = [
  {
    name: "/enable",
    description:
      "Sets the main channel to where the bot will send automated messages",
    demoUrl: EnableDemo,
  },
  {
    name: "/help",
    description: "Provides detailed list of commands and how to use them.",
    demoUrl: HelpDemo,
  },
  {
    name: "/support",
    description: "Provides the link to join the support server.",
    demoUrl: SupportDemo,
  },
  {
    name: "/stats daily {riot id}",
    description: "Displays daily stats for Riot ID specified",
    demoUrl: StatsDailyDemo,
  },
  {
    name: "/stats weekly {riot id}",
    description: "Displays weekly stats for Riot ID specified",
    demoUrl: StatsWeeklyDemo,
  },
  {
    name: "/stats monthly {riot id}",
    description: "Displays monthly stats for Riot ID specified",
    demoUrl: StatsMonthlyDemo,
  },
  {
    name: "/reports weekly",
    description:
      "Displays weekly stat comparison for all summoners in your Guild",
    demoUrl: ReportsWeeklyDemo,
  },
  {
    name: "/reports monthly",
    description:
      "Displays monthly stat comparison for all summoners in your Guild",
    demoUrl: ReportsMonthlyDemo,
  },
  {
    name: "/summoners list",
    description: "Displays all summoners in your Guild",
    demoUrl: SummonersDemo,
  },
  {
    name: "/summoners add {riot id}",
    description: "Adds a summoner to your Guild",
    demoUrl: SummonersAddDemo,
  },
  {
    name: "/summoners remove {riot id}",
    description: "Removes a summoner from your Guild",
    demoUrl: SummonersRemoveDemo,
  },
];

function Commands() {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState("");

  const handleCommandClick = (demoUrl) => {
    setSelectedDemo(demoUrl);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedDemo("");
  };

  return (
    <div className="mt-4 text-sm md:text-base lg:text-lg" id="commands">
      <p className="text-neutral-600 text-lg">04 - Commands</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {commands.map((command, index) => (
          <div
            key={index}
            onClick={() => handleCommandClick(command.demoUrl)}
            className="cursor-pointer hover:font-bold hover:italic"
          >
            <p className="text-lime-300">{command.name}</p>
            <p className=" text-neutral-600">{command.description}</p>
          </div>
        ))}
      </div>

      {/* Popup Component */}
      {showPopup && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75"
          onClick={handleClosePopup}
        >
          <img
            src={selectedDemo}
            alt="Command Demo"
            className="max-w-full max-h-full rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()} // Prevent click from closing when clicking on the image
          />
        </div>
      )}
    </div>
  );
}

export default Commands;
