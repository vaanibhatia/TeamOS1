
import React from 'react';
import { Handle, Position } from '@xyflow/react';

const nodeStyles = {
    feature: {
        icon: '◆',
        label: 'FEATURE',
        style: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50',
        title: 'text-indigo-700 dark:text-indigo-300',
    },
    component: {
        icon: '▣',
        label: 'COMPONENT',
        style: 'border-blue-400 bg-blue-50 dark:bg-blue-950/50',
        title: 'text-blue-700 dark:text-blue-300',
    },
    function: {
        icon: 'ƒ',
        label: 'FUNCTION',
        style: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/50',
        title: 'text-emerald-700 dark:text-emerald-300',
    },
    api: {
        icon: '⇄',
        label: 'API ROUTE',
        style: 'border-orange-400 bg-orange-50 dark:bg-orange-950/50',
        title: 'text-orange-700 dark:text-orange-300',
    },
};

export default function ArchitectureNode({ data }) {
    const config = nodeStyles[data.kind] || nodeStyles.function;

    return (
        <div
            className={`min-w-[190px] max-w-[250px] rounded-xl border-2 px-4 py-3 shadow-sm ${config.style}`}
        >
            <Handle type="target" position={Position.Left} />

            <div className="flex items-center gap-2 mb-2">
                <span className={`text-lg ${config.title}`}>
                    {config.icon}
                </span>

                <span className={`text-[10px] font-bold tracking-wider ${config.title}`}>
                    {config.label}
                </span>
            </div>

            <div className="text-sm font-semibold text-gray-900 dark:text-white break-words">
                {data.label}
            </div>

            {data.file && (
                <div className="mt-2 text-[10px] text-gray-500 dark:text-gray-400 truncate">
                    {data.file}
                </div>
            )}

            {data.line && (
                <div className="mt-1 text-[10px] text-gray-400">
                    Line {data.line}
                </div>
            )}

            <Handle type="source" position={Position.Right} />
        </div>
    );
}
