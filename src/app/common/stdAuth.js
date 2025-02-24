// src/hoc/withAuth.js
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";
import axios from "axios";

const stdAuth = (WrappedComponent) => {
  return (props) => {
    const {
      stdAccessToken,
      getStdAccessToken,
      setStudentInfo,
      studentInfo,
      setStudent_id,
    } = useAuth();
    const router = useRouter();

    // Check if the user is authenticated and redirect to login if not
    useEffect(() => {
      const checkAuth = async () => {
        const token = await getStdAccessToken();
        if (!token) {
          router.push("/student/login");
        }
      };

      checkAuth();
    }, [getStdAccessToken, router]);

    // Fetch student info when component mounts
    useEffect(() => {
      const fetchStdInfo = async () => {
        const response = await axios.get("/api/student/student-info");
        const Info = await response.data.studentInfo;
        setStudentInfo(Info);
      };
      fetchStdInfo();
    }, [setStudentInfo]);

    // Fetch data from Oracle only when studentInfo is available
    useEffect(() => {
      const fetchStdInfoFromOracle = async () => {
        if (studentInfo?.userid) {
          try {
            const response = await axios.get(`/api/classschedule/getdata`, {
              params: { P_USER_ID: studentInfo.userid },
            });
            // Assuming response.data.items is an array and contains the student_id
            setStudent_id(response.data.items);

            // Log the student_id being set
            console.log("Setting student_id:", response.data.items);
          } catch (error) {
            console.error("Error fetching student info from Oracle:", error);
          }
        }
      };

      // Only fetch from Oracle if studentInfo is fully loaded
      if (studentInfo) {
        fetchStdInfoFromOracle();
      }
    }, [studentInfo, setStudent_id]); // Trigger the effect when studentInfo changes
    // Show the component if authenticated, otherwise it will redirect to login
    return stdAccessToken ? <WrappedComponent {...props} /> : null;
  };
};

export default stdAuth;
