// components/MeetOurTeachers.js

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faUserTie, faUserAlt } from '@fortawesome/free-solid-svg-icons';

const MeetOurTeachers = () => {
  const teachers = [
    { 
      title: "Our Online Quran Teachers", 
      link: "/our-teachers", 
      icon: faBookOpen // Represents education and teaching
    },
    { 
      title: "Our Online Male Quran Teachers", 
      link: "/male-quran-teacher", 
      icon: faUserTie // Represents a male teacher
    },
    { 
      title: "Our Online Female Quran Teachers", 
      link: "/female-quran-teacher", 
      icon: faUserAlt // Represents a female teacher
    },
  ];

  return (
    <section className="mt-16 bg-white py-16">
      <div className="max-w-7xl mx-auto text-center px-6">
        <h2 className="text-3xl lg:text-4xl font-bold text-teal-600 mb-4">
          Meet Our Teachers
        </h2>
        <h3 className="text-xl lg:text-2xl font-semibold text-gray-700 mb-6">
          Qualified and Experienced Tutors
        </h3>
        <p className="text-gray-700 font-medium mb-10 text-lg md:text-xl px-4  mx-auto">
          Our dedicated male and female Quran teachers provide personalized education with extensive knowledge and experience.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teachers.map((teacher, index) => (
            <a
              key={index}
              href={teacher.link}
              className="p-6 border border-teal-500 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={teacher.icon} size="3x" className="text-teal-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800">{teacher.title}</h4>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MeetOurTeachers;
