import {handleAllCoursesFetch} from '../../../../controllers/courseCOntroller'
import connectDB from "@/config/db";

export async function GET(req) {
  await connectDB();
  return handleAllCoursesFetch(req);
}
