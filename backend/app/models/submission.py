"""
Data models for the final student submission payload.
Defines the structure expected by the backend when the student submits their mapping.
"""
from pydantic import BaseModel, Field
from typing import List, Optional

class PersonalData(BaseModel):
    """
    Personal data of the student submitted from the frontend.
    Uses aliases to match the camelCase keys sent by the frontend.
    """
    first_name: str = Field(..., alias="firstName")
    surname: str
    street_and_house_number: str = Field(..., alias="streetAndHouseNumber")
    zip_location_country: str = Field(..., alias="zipLocationCountry")
    phone_number: str = Field(..., alias="phoneNumber")
    tum_email: str = Field(..., alias="tumEmail")
    course_at_tum: str = Field(..., alias="courseAtTUM")
    aimed_degree: str = Field(..., alias="aimedDegree")
    registration_number_at_tum: str = Field(..., alias="registrationNumberAtTUM")
    semester_at_tum: str = Field(..., alias="semesterAtTUM")
    name_of_previous_university: str = Field(..., alias="nameOfPreviousUniversity")
    country_of_previous_university: str = Field(..., alias="countryOfPreviousUniversity")
    previous_degree_program: str = Field(..., alias="previousDegreeProgram")
    diploma: str
    number_of_semesters_in_previous_course: str = Field(..., alias="numberOfSemestersInPreviousCourse")
    workload_of_one_credit: str = Field(..., alias="workloadOfOneCredit")
    maximum_grade_at_former_university: str = Field(..., alias="maximumGradeAtFormerUniversity")
    minimum_passing_grade_at_former_university: str = Field(..., alias="minimumPassingGradeAtFormerUniversity")

    class Config:
        populate_by_name = True

class SourceCourseSubmission(BaseModel):
    """
    Details of a source university course.
    """
    source_course_no: str
    source_course_name: str
    source_credits: str
    source_grade: str
    source_content: Optional[str] = None

class TUMModuleSubmission(BaseModel):
    """
    A TUM module and its mapped source courses.
    """
    tum_module_nr: str
    tum_module_title: str
    tum_ects: str
    tum_content: Optional[str] = None
    tum_outcome: Optional[str] = None
    source_courses: List[SourceCourseSubmission]

class SubmissionData(BaseModel):
    """
    The final complete submission payload.
    """
    personal_data: PersonalData = Field(..., alias="personalData")
    mapping_file: Optional[str] = Field(None, alias="mappingFile")
    tum_modules: List[TUMModuleSubmission]

    class Config:
        populate_by_name = True
