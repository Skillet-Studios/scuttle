import { useEffect, useState } from "react";
import api from "../utils/api"; // Import the middleware

function Overview() {
  const [numGuilds, setNumGuilds] = useState(0);
  const [numCommands, setNumCommands] = useState(0);
  const [numSummoners, setNumSummoners] = useState(0);

  const botUrl =
    "https://discord.com/oauth2/authorize?client_id=1222960533523796089&permissions=17600776293376&scope=bot";

  useEffect(() => {
    async function getAnalytics() {
      try {
        const [guildsResponse, commandsResponse, summonersResponse] =
          await Promise.all([
            api.get("/guilds/count"),
            api.get("/commands/count"),
            api.get("/summoners/count"),
          ]);

        setNumGuilds(guildsResponse.data.data.count);
        setNumCommands(commandsResponse.data.data.count);
        setNumSummoners(summonersResponse.data.data.count);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    }

    getAnalytics();
  }, []);

  return (
    <div className="">
      <p className="text-neutral-600 text-lg">01 - Overview</p>
      <h1 className="text-xl md:text-3xl lg:text-4xl xl:w-2/3 text-neutral-300 py-4">
        <span className="text-lime-400 hover:font-bold hover:italic">
          <a href={botUrl}>Scuttle</a>
        </span>{" "}
        is a League of Legends discord bot for analyzing and comparing in-game
        match statistics with members of your server.{" "}
        <span className="text-lime-400 hover:font-bold hover:italic">
          <a href={botUrl}>Click here to get Scuttle.</a>
        </span>
      </h1>

      <div className="flex items-center gap-10 text-neutral-600">
        <p>
          Guilds: <span className="text-lime-400">{numGuilds}</span>
        </p>
        <p>
          Summoners: <span className="text-lime-400">{numSummoners}</span>
        </p>
        <p>
          Commands Sent: <span className="text-lime-400">{numCommands}</span>
        </p>
      </div>
    </div>
  );
}

export default Overview;
