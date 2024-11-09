import Image from "next/image";

const CoursesSection = () => {
  const courses = [
    {
      title: "Quran Reading",
      description: "Learn to read the Quran with Tajweed.",
      imageUrl: "/courses-img-1.jpg",
    },
    {
      title: "Arabic Language",
      description: "Master the basics of Arabic for better understanding.",
      imageUrl: "/courses-img-2.jpg",
    },
    {
      title: "Islamic Studies",
      description: "Gain knowledge about essential Islamic principles.",
      imageUrl: "/courses-img-3.jpg",
    },
  ];

  return (
    <section className="p-10 text-center" id="courses">
      <h2 className="text-3xl font-semibold">Our Courses</h2>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <div
            key={index}
            className="relative border rounded-lg shadow-lg overflow-hidden"
          >
            <Image
              src={course.imageUrl}
              alt={course.title}
              className="w-full h-48 object-cover"
              fill
            />
            <div className="p-6 bg-white">
              <h3 className="text-2xl font-bold">{course.title}</h3>
              <p className="mt-4">{course.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CoursesSection;
