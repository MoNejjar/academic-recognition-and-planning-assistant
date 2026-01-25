
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

    const handleSubmit = () => {
        // Basic submission logic
        alert("Data successfully sent to TUM staff!");

        // Reset state
        setPersonalData(emptyPersonalData);
        setMappingFile(null);
        setTumModules([]);

        // Redirect to home
        navigate('/student');
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
