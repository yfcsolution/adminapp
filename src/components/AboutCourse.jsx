import Image from "next/image";
import React from "react";
const AboutCourse = () => {
  return (
    <div className="flex flex-col md:flex-row mx-3 sm:mx-8 lg:mx-20 xl:mx-60 items-center mt-5 lg:mt-12">
      <div className="w-full lg:w-[60%]">
        <div className="text-left  text-black font-bold text-lg md:text-2xl lg:text-3xl">
          About Courses & Classes
        </div>

        <div className="text-left text-black font-normal text-base mt-2">
          The techniques, strategies, and processes we offer in tutoring these
          courses for Quran Classes Online with Tajweed help the students to
          learn, grow and be self-sufficient in reading Quran in future In Shaa
          Allah. So lets start with us and learn the Holy Quran online with
          Tajweed and Tarteel. Learn to read Quran, understand, learn how to
          recite, memorize in online classes, lessons for kids, adults, females,
          live one to one, over Skype and zoom
        </div>
      </div>
      <div className="w-full lg:w-[40%] order-first md:order-last ">
        <Image
          src="/Images/Courses/AboutCourses.png"
          alt="about course"
          width={400}
          height={400}
          className="rounded-lg"
        />
      </div>
    </div>
  );
};

export default AboutCourse;
