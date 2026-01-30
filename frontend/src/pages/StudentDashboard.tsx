
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import SideMenu from "../components/SideMenu";

import PersonalDataPage from "./PersonalDataPage";
import MappingUploadPage from "./MappingUploadPage";
import CatalogueUploadPage from "./CatalogueUploadPage";
import FinalReviewPage from "./FinalReviewPage";
import HealthCheck from "../components/HealthCheck";
import { useState } from "react";
import { TUMModuleMapping, PersonalData, emptyPersonalData } from "../types";

export default function StudentDashboard() {
    const navigate = useNavigate();
    const [personalData, setPersonalData] = useState<PersonalData>(emptyPersonalData);
    const [mappingFile, setMappingFile] = useState<File | null>(null);
    const [tumModules, setTumModules] = useState<TUMModuleMapping[]>([]);

    const handlePersonalDataConfirmed = (data: PersonalData) => {
        setPersonalData(data);
    };

    const handleMappingsConfirmed = (file: File | null, modules: TUMModuleMapping[]) => {
        setMappingFile(file);
        setTumModules(modules);
    };

    const handleContentConfirmed = (updatedModules: TUMModuleMapping[]) => {
        setTumModules(updatedModules);
    };

    const handleSubmit = async () => {
        try {
            // Prepare submission data
            const submissionData = {
                personalData: personalData,
                mappingFile: mappingFile?.name || null,
                tumModules: tumModules.map(mod => ({
                    tum_module_nr: mod.tum_module_nr,
                    tum_module_title: mod.tum_module_title,
                    tum_ects: mod.tum_ects,
                    tum_content: mod.tum_content,
                    tum_outcome: mod.tum_outcome,
                    source_courses: mod.source_courses.map(sc => ({
                        source_course_no: sc.source_course_no,
                        source_course_name: sc.source_course_name,
                        source_credits: sc.source_credits,
                        source_grade: sc.source_grade,
                        source_content: sc.source_content
                    }))
                }))
            };

            console.log('Submitting data:', JSON.stringify(submissionData, null, 2));

            const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_URL}/api/submissions/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData)
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Backend error:', error);
                const errorMessage = typeof error.detail === 'string' 
                    ? error.detail 
                    : JSON.stringify(error.detail, null, 2);
                throw new Error(errorMessage);
            }

            const result = await response.json();
            
            alert(`Application submitted successfully!\nSubmission ID: ${result.submission_id}`);

            // Reset state
            setPersonalData(emptyPersonalData);
            setMappingFile(null);
            setTumModules([]);

            // Redirect to home
            navigate('/student');
        } catch (error) {
            console.error('Submission error:', error);
            alert(`Submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };



    // Calculate progress for SideMenu
    const progress = {
        personalData: true, // Always open
        mapping: !!personalData.firstName, // Completed Personal Data
        catalogue: tumModules.length > 0, // Completed Mapping (at least has modules)
        review: tumModules.length > 0 && tumModules.some(m => !!m.tum_content || m.source_courses.some(sc => !!sc.source_content)) // Has some content
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
            <SideMenu progress={progress} />
            <div className="ml-[260px] flex-1 p-8">
                <Routes>
                    <Route
                        path="/"
                        element={
                            <PersonalDataPage
                                onDataConfirmed={handlePersonalDataConfirmed}
                                existingData={personalData}
                            />
                        }
                    />
                    <Route
                        path="/mapping"
                        element={
                            <MappingUploadPage
                                onMappingsConfirmed={handleMappingsConfirmed}
                                existingModules={tumModules}
                                existingFile={mappingFile}
                            />
                        }
                    />
                    <Route
                        path="/catalogue"
                        element={
                            <CatalogueUploadPage
                                tumModules={tumModules}
                                onContentConfirmed={handleContentConfirmed}
                            />
                        }
                    />
                    <Route
                        path="/review"
                        element={
                            <FinalReviewPage
                                personalData={personalData}
                                onPersonalDataChange={setPersonalData}
                                mappingFile={mappingFile}
                                tumModules={tumModules}
                                onSubmit={handleSubmit}
                            />
                        }
                    />

                    <Route path="*" element={<Navigate to="/student" replace />} />
                </Routes>
            </div>
            <HealthCheck />
        </div>
    );
}
