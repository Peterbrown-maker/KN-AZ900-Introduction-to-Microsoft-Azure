import type { Course, CourseId } from '@/types/course';
import { chapters as az900Chapters } from './chapters';
import { dp900Chapters } from './dp900/chapters';

export const courses: Record<CourseId, Course> = {
  az900: {
    id: 'az900',
    storageKey: 'az900-progress',
    title: 'AZ-900',
    subtitle: 'Azure Fundamentals',
    description:
      'Build a mental model of how Azure works — from compute and storage to identity, security, governance, and pricing.',
    accent: '#0078d4',
    icon: 'Cloud',
    chapters: az900Chapters,
    conceptMap: [
      { label: 'CLOUD', color: '#0078d4', children: ['IaaS', 'PaaS', 'SaaS', 'Public / Private / Hybrid'] },
      { label: 'NETWORK', color: '#22d3ee', children: ['VNet', 'Subnet', 'Load Balancer', 'VPN / ExpressRoute', 'DNS', 'CDN'] },
      { label: 'STORAGE', color: '#22c55e', children: ['Blob', 'Files', 'Queue', 'Table', 'LRS / ZRS / GRS / GZRS'] },
      { label: 'IDENTITY', color: '#8b5cf6', children: ['Entra ID', 'AuthN / AuthZ', 'SSO', 'MFA', 'B2B / B2C'] },
      { label: 'SECURITY', color: '#ef4444', children: ['Conditional Access', 'RBAC', 'Zero Trust', 'Defense in Depth', 'Key Vault'] },
      { label: 'GOVERNANCE', color: '#f59e0b', children: ['Azure Policy', 'Resource Locks', 'Management Groups'] },
    ],
    memoryLines: [
      'Compute decides. Storage remembers.',
      'Network moves. CDN delivers closer.',
    ],
  },
  dp900: {
    id: 'dp900',
    storageKey: 'dp900-progress',
    title: 'DP-900',
    subtitle: 'Azure Data Fundamentals',
    description:
      'Master how data works in Azure — from relational and non-relational data to analytics, data lakes, warehouses, and Power BI.',
    accent: '#10b981',
    icon: 'Database',
    chapters: dp900Chapters,
    conceptMap: [
      { label: 'DATA CORE', color: '#10b981', children: ['Structured', 'Semi-structured', 'Unstructured', 'Relational vs Non-relational'] },
      { label: 'RELATIONAL', color: '#3b82f6', children: ['Azure SQL', 'PostgreSQL', 'MySQL', 'ACID', 'Normalization', 'SQL Queries'] },
      { label: 'NON-RELATIONAL', color: '#f59e0b', children: ['Cosmos DB', 'Table Storage', 'Document', 'Key-Value', 'Graph', 'Column-family'] },
      { label: 'ANALYTICS', color: '#8b5cf6', children: ['Synapse', 'Data Lake', 'Warehouse', 'Lakehouse', 'ETL / ELT', 'Medallion'] },
      { label: 'VISUALIZATION', color: '#ec4899', children: ['Power BI', 'Datasets', 'Reports', 'Dashboards', 'Workspaces'] },
      { label: 'PROCESSING', color: '#22d3ee', children: ['Batch', 'Streaming', 'Azure Data Factory', 'Spark', 'Real-time'] },
    ],
    memoryLines: [
      'Relational enforces. Non-relational flexes.',
      'Data lakes store everything. Warehouses answer questions.',
    ],
  },
};

export const courseList = Object.values(courses);
