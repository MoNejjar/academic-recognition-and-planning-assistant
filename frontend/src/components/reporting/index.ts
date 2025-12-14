/* 
 * Reporting Components
 * 
 * This module handles presentation of matching results:
 * - Match score visualization in UI
 * - PDF report generation/preview
 * - Data presentation for staff and professors
 */

// TODO: Implement MatchScoreChart component
// TODO: Implement ReportPreview component
// TODO: Implement PDFExportButton component
// TODO: Implement DataSummaryPanel component

/* 
 * Reporting Components
 * 
 * This module handles presentation of matching results:
 * - Match score visualization in UI
 * - PDF report generation/preview
 * - Data presentation for staff and professors
 */

// TODO: Implement MatchScoreChart component
// TODO: Implement ReportPreview component
// TODO: Implement PDFExportButton component
// TODO: Implement DataSummaryPanel component


/* 
 * Reporting components
 * 
 * This module handles presentation of matching results:
 * - Match score visualization in UI
 * - PDF report generation/preview
 * - Data presentation for staff and professors
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, BarChart3, FileText } from "lucide-react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// Types
export interface MatchScoreData {
  module: string;
  score: number;
}

export interface ReportDataSummary {
  totalCourses: number;
  avgScore: number;
  highestScore: number;
  lowestScore: number;
}

/* --------------------------------------------
 * MatchScoreChart Component
 * -------------------------------------------- */
export const MatchScoreChart: React.FC<{ data: MatchScoreData[] }> = ({ data }) => {
  return (
    <Card className="p-4 rounded-2xl shadow">
      <CardContent>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" /> Match Score Overview
        </h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="module" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="score" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

/* --------------------------------------------
 * ReportPreview Component
 * -------------------------------------------- */
export const ReportPreview: React.FC<{ html: string }> = ({ html }) => {
  return (
    <Card className="p-4 rounded-2xl shadow max-h-[500px] overflow-auto bg-white">
      <CardContent>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" /> Report Preview
        </h2>
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      </CardContent>
    </Card>
  );
};

/* --------------------------------------------
 * PDFExportButton Component
 * -------------------------------------------- */
export const PDFExportButton: React.FC<{ onExport: () => void }> = ({ onExport }) => {
  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
      <Button onClick={onExport} className="rounded-2xl shadow flex items-center gap-2">
        <Download className="w-4 h-4" /> Export PDF
      </Button>
    </motion.div>
  );
};

/* --------------------------------------------
 * DataSummaryPanel Component
 * -------------------------------------------- */
export const DataSummaryPanel: React.FC<{ summary: ReportDataSummary }> = ({ summary }) => {
  const items = [
    { label: "Total Courses Matched", value: summary.totalCourses },
    { label: "Average Match Score", value: `${summary.avgScore}%` },
    { label: "Highest Score", value: `${summary.highestScore}%` },
    { label: "Lowest Score", value: `${summary.lowestScore}%` },
  ];

  return (
    <Card className="p-4 rounded-2xl shadow bg-gray-50">
      <CardContent>
        <h2 className="text-xl font-semibold mb-4">Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.label} className="p-3 bg-white rounded-xl shadow-sm">
              <p className="text-sm text-gray-600">{item.label}</p>
              <p className="text-lg font-bold">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
