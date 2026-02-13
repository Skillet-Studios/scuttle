function Resources() {
  const botUrl =
    "https://discord.com/oauth2/authorize?client_id=1222960533523796089&permissions=17600776293376&scope=bot";
  const supportUrl = "https://discord.com/invite/temu6Xt9Dv";
  return (
    <div className="text-neutral-300">
      <p className="text-neutral-600 text-lg">02 - Resources</p>
      <div className="flex gap-6 mt-5">
        <div className="flex flex-col gap-3">
          <a href="#about" className="hover:font-bold hover:italic">
            About
          </a>
          <a href="#commands" className="hover:font-bold hover:italic">
            Commands
          </a>
          <a
            href={supportUrl}
            className="text-lime-300 hover:font-bold hover:italic"
          >
            Support
          </a>
        </div>
        <div className="flex flex-col gap-3">
          <a
            href={botUrl}
            className="text-lime-300 hover:font-bold hover:italic"
          >
            Add Bot
          </a>
          <a href="/privacy-policy" className="hover:font-bold hover:italic">
            Privacy Policy
          </a>
          <a href="/tos" className="hover:font-bold hover:italic">
            Terms and Conditions
          </a>
        </div>
      </div>
    </div>
  );
}

export default Resources;
