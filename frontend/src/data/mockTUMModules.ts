/**
 * Mock TUM Module Mappings for Demo/Testing
 * 
 * Pre-filled module data to skip the workflow and jump to analytics.
 */

import { TUMModuleMapping } from '../types';

export const mockTUMModules: TUMModuleMapping[] = [
    {
        id: 'demo-1',
        tum_module_nr: 'IN2001',
        tum_module_title: 'Algorithms and Data Structures',
        tum_ects: '8',
        tum_content: 'This module covers fundamental algorithms and data structures including sorting, searching, graph algorithms, trees, hash tables, and complexity analysis. Students learn to design efficient algorithms and analyze their performance.',
        tum_outcome: 'Students can analyze algorithmic complexity and determine asymptotic bounds. Students can implement standard data structures and understand their tradeoffs. Students master algorithmic paradigms including divide-and-conquer, greedy, and dynamic programming. Students can apply graph algorithms to solve practical problems.',
        source_courses: [
            {
                id: 'demo-sc-1',
                source_course_no: 'CS201',
                source_course_name: 'Data Structures',
                source_credits: '4',
                source_grade: '1.3',
                source_content: 'Analyze time and space complexity of algorithms using Big-O notation. Design and implement fundamental data structures including linked lists, trees, graphs, and hash tables. Understand memory management and pointer operations.'
            },
            {
                id: 'demo-sc-2',
                source_course_no: 'CS202',
                source_course_name: 'Algorithm Design',
                source_credits: '4',
                source_grade: '1.7',
                source_content: 'Apply divide-and-conquer and dynamic programming strategies to solve computational problems. Implement graph traversal algorithms (BFS, DFS) and shortest path algorithms. Analyze algorithm correctness and efficiency.'
            }
        ]
    },
    {
        id: 'demo-2',
        tum_module_nr: 'IN2100',
        tum_module_title: 'Software Engineering',
        tum_ects: '6',
        tum_content: 'Introduction to software engineering principles, methodologies, and tools. Topics include requirements engineering, software architecture, design patterns, testing strategies, and project management.',
        tum_outcome: 'Students understand and can apply modern software development processes. Students can design and implement comprehensive test strategies. Students can design software architectures using established patterns. Students can work effectively in software development teams.',
        source_courses: [
            {
                id: 'demo-sc-3',
                source_course_no: 'SE101',
                source_course_name: 'Introduction to Software Engineering',
                source_credits: '4',
                source_grade: '2.0',
                source_content: 'Apply software development methodologies including Agile and Waterfall. Write unit tests and integration tests using industry-standard frameworks. Use version control systems (Git) effectively in team settings. Understand basic software design principles.'
            }
        ]
    },
    {
        id: 'demo-3',
        tum_module_nr: 'IN2020',
        tum_module_title: 'Database Systems',
        tum_ects: '6',
        tum_content: 'Fundamentals of database systems including relational model, SQL, normalization, transaction processing, and query optimization. Introduction to NoSQL databases and distributed data management.',
        tum_outcome: 'Students can design normalized database schemas (up to BCNF). Students master SQL and relational algebra. Students can analyze transaction processing and concurrency control. Students understand query optimization and execution plans.',
        source_courses: [
            {
                id: 'demo-sc-4',
                source_course_no: 'DB110',
                source_course_name: 'Fundamentals of Databases',
                source_credits: '6',
                source_grade: '1.7',
                source_content: 'Design relational database schemas using normalization principles up to 3NF. Write complex SQL queries including joins, subqueries, and aggregations. Understand transaction concepts including ACID properties. Implement basic database applications.'
            }
        ]
    }
];
