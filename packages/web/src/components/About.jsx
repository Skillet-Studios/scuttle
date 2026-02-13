function About() {
  return (
    <div
      className="xl:w-2/3 text-neutral-300 text-sm md:text-base lg:text-lg"
      id="about"
    >
      <p className="text-neutral-600 text-lg">03 - About</p>
      <div className="flex flex-col gap-6">
        <p className=" text-neutral-300 mt-5">
          Scuttle is a League of Legends discord bot for diplaying summoner
          match data. Some of the stats provided are Average Assists, Average
          Kill Participation, Average Gold per Minute, Average Damage to
          Champions, and many more.
        </p>

        <p className=" text-neutral-300">🚀 Getting started</p>

        <ul className="text-neutral-400">
          <li>1. Add Scuttle to your server.</li>
          <li>
            2. Type /enable in the channel you wish to receive automated
            reports.
          </li>
          <li>
            3. Add summoners to your Guild using /summoners add &#123;Name&#125;
            &#123;Tag&#125;
          </li>

          <li>
            4. Wait until the start of the next hour before Scuttle has
            retreived and updated the data for all the Summoners in your Guild.
          </li>
        </ul>
      </div>
    </div>
  );
}

export default About;
