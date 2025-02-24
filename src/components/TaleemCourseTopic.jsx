import React from 'react'

const TaleemCourseTopic = ({topics}) => {
 
    return topics?.map((topic, index) => (
        <li key={index} className={topic.includes(":") ? "font-bold" : ""}>{topic}</li>
      ));
  
}

export default TaleemCourseTopic