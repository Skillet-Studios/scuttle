const PrivacyPolicy = () => {
  return (
    <main className="max-w-2xl mx-auto">
      <div className="p-12">
        <a
          href="/"
          className="btn btn-ghost text-neutral-300 text-lg font-bold hover:text-white"
        >
          Back
        </a>
        <h1 className="text-3xl font-extrabold py-6 text-lime-300">
          Privacy Policy for Scuttle
        </h1>

        <pre className="leading-relaxed whitespace-pre-wrap text-neutral-300">
          {`Privacy Policy for Scuttle 
Effective Date: August 20, 2024
  
Thank you for using Scuttle. This Privacy Policy explains how we collect, use, and protect your information when you use our Discord bot.

Information We Collect
User Data: We collect your Discord username, League of Legends username, and League of Legends match data.
Non-Personal Data: We collect the Discord server ID where Scuttle is used.
Purpose of Data Collection
We collect your data solely for match analytics to provide you with insights and information related to your League of Legends matches.

Data Sharing
We do not share your data with any other parties. Your information is used exclusively for the purposes described in this Privacy Policy.

Children's Privacy
We do not knowingly collect any personal data from children under the age of 13. If we discover that we have collected such data, we will take steps to delete it promptly.

Updates to This Privacy Policy
We may update this Privacy Policy from time to time. When we do, we will notify you via email.

Contact Information
If you have any questions or concerns about this Privacy Policy, please contact us at eduardoandresalba@gmail.com.


By using Scuttle, you consent to the terms of this Privacy Policy.`}
        </pre>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
