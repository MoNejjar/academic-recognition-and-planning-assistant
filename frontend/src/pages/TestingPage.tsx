
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Loader2, Plus, Trash2, BookOpen } from 'lucide-react';
import { TUM_COLORS } from '../styles/tumStyles';
import { addManualTask } from '../data/taskManager';
import { analyzeModules } from '../services/analyticsApi';



export default function TestingPage() {
    const navigate = useNavigate();
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Form inputs
    // Form inputs
    const [sourceModules, setSourceModules] = useState([{ name: '', description: '', outcomes: '' }]);
    const [targetModule, setTargetModule] = useState({ name: '', code: 'INxxxx', description: '', outcomes: '' });

    const handleAddSource = () => {
        setSourceModules([...sourceModules, { name: '', description: '', outcomes: '' }]);
    };

    const handleRemoveSource = (index: number) => {
        setSourceModules(sourceModules.filter((_, i) => i !== index));
    };

    const handleSourceChange = (index: number, field: string, value: string) => {
        const newSources = [...sourceModules];
        newSources[index] = { ...newSources[index], [field]: value };
        setSourceModules(newSources);
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            // Prepare inputs for API
            const tumModule = {
                id: `test-${Date.now()}`,
                tum_module_nr: targetModule.code || 'MANUAL-TEST',
                tum_module_title: targetModule.name || 'Target Module',
                tum_ects: '6', // Default for testing
                tum_content: targetModule.description,
                tum_outcome: targetModule.outcomes,
                source_courses: sourceModules.map((s, i) => ({
                    id: `src-${Date.now()}-${i}`,
                    source_course_no: `SRC-${i + 1}`,
                    source_course_name: s.name || `Source ${i + 1}`,
                    source_credits: '5', // Default
                    source_grade: 'N/A',
                    // Combine description and outcomes for source content as backend expects single field
                    source_content: `Description:\n${s.description}\n\nLearning Outcomes:\n${s.outcomes}`
                }))
            };

            // Call Backend API
            const response = await analyzeModules({
                tumModules: [tumModule],
                studentName: "Manual Test User",
                previousUniversity: "Manual Input",
                previousCountry: "Unknown"
            });

            if (response && response.moduleResults && response.moduleResults.length > 0) {
                // Save to Task Manager
                const result = response.moduleResults[0];
                addManualTask(result);

                // Redirect to Tasks list
                navigate('/staff/tasks');
            } else {
                console.error("No results returned from analysis API");
                alert("Analysis returned no results. Please check your inputs.");
            }

        } catch (error) {
            console.error("Analysis failed:", error);
            alert("Analysis failed. Please ensure the backend is running and LLM is configured.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: 32, fontFamily: 'Arial, sans-serif' }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: TUM_COLORS.gray80, marginBottom: 8 }}>
                    LLM Recognition Playground
                </h1>
                <p style={{ color: TUM_COLORS.gray50 }}>
                    Manually test the recognition capability by entering module data directly.
                </p>
            </div>

            {/* Content Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Info Box */}
                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1e40af' }}>How it works</div>
                    <p style={{ fontSize: 13, color: '#1e3a8a', margin: 0 }}>
                        Enter the details of the TUM module and the student's source module(s).
                        The AI will analyze the equivalence and <strong>create a new task</strong> in your queue.
                    </p>
                </div>

                {/* Target Module Section */}
                <div style={{ backgroundColor: 'white', padding: 24, borderRadius: 8, border: '1px solid #E5E7EB' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: TUM_COLORS.gray80, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BookOpen size={18} color={TUM_COLORS.blue} />
                        Target TUM Module
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                            <input
                                placeholder="Code (e.g. IN2000)"
                                value={targetModule.code}
                                onChange={(e) => setTargetModule({ ...targetModule, code: e.target.value })}
                                style={inputStyle}
                            />
                            <input
                                placeholder="Module Name"
                                value={targetModule.name}
                                onChange={(e) => setTargetModule({ ...targetModule, name: e.target.value })}
                                style={inputStyle}
                            />
                        </div>
                        <textarea
                            placeholder="Paste Target Module Description..."
                            value={targetModule.description}
                            onChange={(e) => setTargetModule({ ...targetModule, description: e.target.value })}
                            style={{ ...inputStyle, minHeight: 80, fontSize: 13, resize: 'vertical' }}
                        />
                        <textarea
                            placeholder="Paste Target Learning Outcomes..."
                            value={targetModule.outcomes}
                            onChange={(e) => setTargetModule({ ...targetModule, outcomes: e.target.value })}
                            style={{ ...inputStyle, minHeight: 80, fontSize: 13, resize: 'vertical' }}
                        />
                    </div>
                </div>

                {/* Source Modules Section */}
                <div style={{ backgroundColor: 'white', padding: 24, borderRadius: 8, border: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: TUM_COLORS.gray80 }}>
                            Source Modules (Input)
                        </h3>
                        <button
                            onClick={handleAddSource}
                            style={{ fontSize: 12, color: TUM_COLORS.blue, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                            <Plus size={14} /> Add Source
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {sourceModules.map((source, index) => (
                            <div key={index} style={{ padding: 12, backgroundColor: '#F9FAFB', borderRadius: 6, border: '1px solid #F3F4F6' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <input
                                        placeholder={`Source Module ${index + 1} Name`}
                                        value={source.name}
                                        onChange={(e) => handleSourceChange(index, 'name', e.target.value)}
                                        style={{ ...inputStyle, marginBottom: 0, fontWeight: 500 }}
                                    />
                                    {sourceModules.length > 1 && (
                                        <button onClick={() => handleRemoveSource(index)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    placeholder="Paste Description / Content..."
                                    value={source.description}
                                    onChange={(e) => handleSourceChange(index, 'description', e.target.value)}
                                    style={{ ...inputStyle, minHeight: 80, fontSize: 13, marginBottom: 12 }}
                                />
                                <textarea
                                    placeholder="Paste Learning Outcomes (Optional)..."
                                    value={source.outcomes}
                                    onChange={(e) => handleSourceChange(index, 'outcomes', e.target.value)}
                                    style={{ ...inputStyle, minHeight: 80, fontSize: 13 }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        style={{
                            padding: '16px 24px',
                            backgroundColor: TUM_COLORS.blue,
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 16,
                            fontWeight: 600,
                            cursor: isAnalyzing ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 12,
                            opacity: isAnalyzing ? 0.8 : 1
                        }}
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Play size={20} fill="white" />
                                Run Analysis & Create Task
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}

const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #D1D5DB',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit'
};
