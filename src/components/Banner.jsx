import Link from "next/link";

const Banner = ({ breadcrumbData }) => (

  <div className="flex flex-col items-center justify-center w-full py-2">
    <div className="max-w-2xl px-2 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-center text-teal-800 mb-4">{breadcrumbData?.name}</h1>
      <nav className="flex items-center justify-center space-x-2">
        <Link href={breadcrumbData?.link} className="text-teal-500 hover:text-teal-600">Home</Link>
        <span className="text-gray-400">/</span>
        <span className="text-teal-600">{breadcrumbData?.name}</span>
      </nav>
    </div>
  </div>
);

export default Banner;
