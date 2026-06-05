const HeroSection = () => {
  return (
    <section className="text-center p-10">
      <h1 className="text-4xl font-bold text-foreground">Welcome to Rayan Academy</h1>
      <p className="text-lg mt-4 text-foreground">
        Your path to learning the Quran and Arabic with ease.
      </p>
      <button className="mt-6 px-4 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded transition">
        Join Now
      </button>
    </section>
  );
};

export default HeroSection;
