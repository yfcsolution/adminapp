import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGraduate, faStar, faHeadset } from '@fortawesome/free-solid-svg-icons';

const WhoWeAre = () => {
  return (
    <div className="py-8">
      <div className="bg-teal-600 text-white text-center py-10 px-4">
        <h1 className="text-3xl font-bold mb-4">Who We Are – Your Trusted Online Quran Academy</h1>
        <p className="w-[90%] mx-auto text-lg">
          Our Online Quran Academy is committed to providing high-quality Quran education to students worldwide.
          With a team of experienced and dedicated teachers, we offer online Quran classes for kids and adults, ensuring each
          student receives personalized attention and support. Join us to learn Quran online in an engaging and interactive way that brings convenience to your learning journey.
        </p>

        <div className="flex flex-col items-center p-2 lg:flex-row gap-6 justify-center mt-10 px-4">
          {/* Card 1: OUR VISION */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-lg md:max-w-xl hover:scale-105 transform transition duration-300 ease-in-out">
            <div className="text-teal-600 text-4xl mb-4">
              <FontAwesomeIcon icon={faUserGraduate} width={80} height={5} />
            </div>
            <h3 className="text-xl font-semibold text-teal-800 mb-2">OUR VISION</h3>
            <p className="text-teal-700">
              We offer comprehensive online Quran classes tailored for all ages and levels. Our mission is to be the best choice for students seeking online Quran classes for kids and adults alike, where learning is made easy, accessible, and effective. We aim to build long-term relationships with students and families by helping them achieve their Quranic goals.
            </p>
          </div>

          {/* Card 2: OUR CORE VALUES */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-lg md:max-w-xl hover:scale-105 transform transition duration-300 ease-in-out">
            <div className="text-teal-600 text-4xl mb-4">
              <FontAwesomeIcon icon={faStar} width={80} height={5} />
            </div>
            <h3 className="text-xl font-semibold text-teal-800 mb-2">OUR CORE VALUES</h3>
            <p className="text-teal-700">
              Our Online Quran Academy is built on the foundation of trust, transparency, and dedication to quality. We let our students know that time and effort are valued, and we strive to provide the best online Quran classes through qualified instructors and a supportive environment.
            </p>
          </div>

          {/* Card 3: STUDENT SUPPORT */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-lg md:max-w-xl hover:scale-105 transform transition duration-300 ease-in-out">
            <div className="text-teal-600 text-4xl mb-4">
              <FontAwesomeIcon icon={faHeadset} width={80} height={5} />
            </div>
            <h3 className="text-xl font-semibold text-teal-800 mb-2">STUDENT SUPPORT</h3>
            <p className="text-teal-700">
              Our academy provides a professional, friendly support team available 24/7 to assist you. Whether you have questions about our online Quran classes or need guidance, you can reach us anytime by phone, chat, email, or text. We're here to ensure your Quranic education is smooth and fulfilling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhoWeAre;
