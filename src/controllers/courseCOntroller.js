import courseSchema from "@/models/courseSchema";
import { NextResponse } from "next/server";

export const handleCourseInsertion = async (req) => {
  const {
    COURSE_ID_PK,
    COURSE_CATEGORY_ID_FK,
    COURSE_NAME,
    COURSE_SHORT_NAME,
    STATUS,
    LANGUAGE_ID,
    COURSE_FEE,
    COURSE_DURATION,
    USER_FILE_NAME,
    INTERNAL_FILE_NAME,
    CREATED_BY,
    CREATED_DATE,
    UPDATED_BY,
    UPDATED_DATE,
    COURSE_GENDER,
    SORTING,
    COURSE_ADDED,
    IMAGE_LINK,
    COURSE_DESCRIPTION,
    CLASS_START_DATE,
    COURSE_STATUS,
  } = await req.json();

  try {
    // Create a new Course instance
    const newCourse = new courseSchema({
      COURSE_ID_PK,
      COURSE_CATEGORY_ID_FK,
      COURSE_NAME,
      COURSE_SHORT_NAME,
      STATUS,
      LANGUAGE_ID,
      COURSE_FEE,
      COURSE_DURATION,
      USER_FILE_NAME,
      INTERNAL_FILE_NAME,
      CREATED_BY,
      CREATED_DATE,
      UPDATED_BY,
      UPDATED_DATE,
      COURSE_GENDER,
      SORTING,
      COURSE_ADDED,
      IMAGE_LINK,
      COURSE_DESCRIPTION,
      CLASS_START_DATE,
      COURSE_STATUS,
    });

    // Save the course to the database
    const savedCourse = await newCourse.save();

    // Respond with success
    return NextResponse.json({
      message: "Course added successfully",
      course: savedCourse,
    });
  } catch (error) {
    console.error("Error adding course:", error);

    // Respond with error
    return NextResponse.json(
      { message: "Error adding course", error: error.message },
      { status: 500 }
    );
  }
};

export const handleCourseFetch = async () => {
  try {
    // Fetch all courses from the database
    const courses = await courseSchema.find({ COURSE_CATEGORY_ID_FK: 2 });

    // Respond with the fetched courses
    return NextResponse.json({
      message: "Courses fetched successfully",
      courses: courses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);

    // Respond with error
    return NextResponse.json(
      { message: "Error fetching courses", error: error.message },
      { status: 500 }
    );
  }
};

// fetch all courses

export const handleAllCoursesFetch = async () => {
  try {
    // Fetch all courses from the database
    const courses = await courseSchema.find();

    // Respond with the fetched courses
    return NextResponse.json({
      message: "Courses fetched successfully",
      courses: courses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);

    // Respond with error
    return NextResponse.json(
      { message: "Error fetching courses", error: error.message },
      { status: 500 }
    );
  }
};
