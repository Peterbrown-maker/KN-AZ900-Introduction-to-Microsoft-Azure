export interface ScenarioQuestion {
  scenario: string;
  options: { id: string; text: string; icon: string }[];
  correctId: string;
  explanation: string;
}

export const relationalScenarioQuestions: ScenarioQuestion[] = [
  {
    scenario:
      'An e-commerce platform needs to store customer orders with strict referential integrity between Orders and Customers tables. Which service?',
    options: [
      { id: 'a', text: 'Azure Cosmos DB', icon: 'Globe' },
      { id: 'b', text: 'Azure SQL Database', icon: 'Database' },
      { id: 'c', text: 'Azure Blob Storage', icon: 'FileVideo' },
      { id: 'd', text: 'Azure Table Storage', icon: 'Table' },
    ],
    correctId: 'b',
    explanation:
      'Azure SQL Database enforces foreign keys and referential integrity, making it the right choice when relationships between tables must be guaranteed.',
  },
  {
    scenario:
      'A team wants to run PostgreSQL on Azure with minimal management overhead — patching, backups, and high availability handled for them. Which option?',
    options: [
      { id: 'a', text: 'PostgreSQL on a VM', icon: 'Server' },
      { id: 'b', text: 'Azure Database for PostgreSQL (PaaS)', icon: 'Database' },
      { id: 'c', text: 'Azure SQL Database', icon: 'Database' },
      { id: 'd', text: 'Cosmos DB PostgreSQL API', icon: 'Globe' },
    ],
    correctId: 'b',
    explanation:
      'Azure Database for PostgreSQL is the managed PaaS offering — Microsoft handles patching, backups, scaling, and high availability for you.',
  },
  {
    scenario:
      'You need to run a complex analytical query across millions of sales records with columnar storage and auto-scaling. Which service?',
    options: [
      { id: 'a', text: 'Azure SQL Database (single database)', icon: 'Database' },
      { id: 'b', text: 'Azure Synapse Analytics SQL Pool', icon: 'Layers' },
      { id: 'c', text: 'Azure Blob Storage', icon: 'FileVideo' },
      { id: 'd', text: 'Azure Table Storage', icon: 'Table' },
    ],
    correctId: 'b',
    explanation:
      'Synapse Analytics SQL Pool uses massively parallel processing (MPP) with columnar storage, designed specifically for heavy analytical queries.',
  },
  {
    scenario:
      'A banking transaction must guarantee that if a transfer fails midway, both accounts return to their original state. Which property is this?',
    options: [
      { id: 'a', text: 'Atomicity', icon: 'Atom' },
      { id: 'b', text: 'Consistency', icon: 'CheckCircle' },
      { id: 'c', text: 'Isolation', icon: 'Lock' },
      { id: 'd', text: 'Durability', icon: 'HardDrive' },
    ],
    correctId: 'a',
    explanation:
      'Atomicity means "all or nothing" — a transaction either fully completes or is rolled back entirely. No partial writes survive a failure.',
  },
];

export const nonRelationalScenarioQuestions: ScenarioQuestion[] = [
  {
    scenario:
      'An IoT application ingests sensor readings with varying fields per device — some send temperature, others humidity, pressure, and more. Which database?',
    options: [
      { id: 'a', text: 'Azure SQL Database', icon: 'Database' },
      { id: 'b', text: 'Azure Cosmos DB', icon: 'Globe' },
      { id: 'c', text: 'Azure Files', icon: 'FolderOpen' },
      { id: 'd', text: 'Azure Queue Storage', icon: 'ListOrdered' },
    ],
    correctId: 'b',
    explanation:
      'Cosmos DB handles flexible, schema-less documents. Each reading can have different fields without schema migrations — ideal for heterogeneous IoT data.',
  },
  {
    scenario:
      'A social media app needs to store user profiles, posts, and relationships (who follows whom). Which Cosmos DB API best models the relationships?',
    options: [
      { id: 'a', text: 'MongoDB API (documents)', icon: 'FileText' },
      { id: 'b', text: 'Gremlin API (graph)', icon: 'Share2' },
      { id: 'c', text: 'Table API (key-value)', icon: 'Table' },
      { id: 'd', text: 'Cassandra API (column-family)', icon: 'Grid3x3' },
    ],
    correctId: 'b',
    explanation:
      'Gremlin API models data as a graph — vertices for entities and edges for relationships. Following/follower connections are graph traversals.',
  },
  {
    scenario:
      'A global gaming leaderboard needs sub-millisecond reads across 5 regions with automatic multi-region writes. Which Cosmos DB feature?',
    options: [
      { id: 'a', text: 'Single-region writes', icon: 'MapPin' },
      { id: 'b', text: 'Multi-region writes with conflict resolution', icon: 'Globe' },
      { id: 'c', text: 'Azure CDN', icon: 'Network' },
      { id: 'd', text: 'Azure Redis Cache', icon: 'Zap' },
    ],
    correctId: 'b',
    explanation:
      'Cosmos DB multi-region writes let all regions serve both reads and writes with automatic conflict resolution, enabling sub-ms latency worldwide.',
  },
  {
    scenario:
      'You want a simple, low-cost key-value store for session data with no complex queries needed. Which option?',
    options: [
      { id: 'a', text: 'Azure Table Storage', icon: 'Table' },
      { id: 'b', text: 'Azure SQL Database', icon: 'Database' },
      { id: 'c', text: 'Azure Synapse Analytics', icon: 'Layers' },
      { id: 'd', text: 'Azure Blob Storage (hot tier)', icon: 'FileVideo' },
    ],
    correctId: 'a',
    explanation:
      'Table Storage is a simple, inexpensive key-value store. For simple lookup-by-key patterns without complex querying, it is the most cost-effective choice.',
  },
];

export const analyticsScenarioQuestions: ScenarioQuestion[] = [
  {
    scenario:
      'A company has 5 TB of raw CSV files and wants to query them with SQL without moving them into a relational database first. What should they use?',
    options: [
      { id: 'a', text: 'Azure SQL Database', icon: 'Database' },
      { id: 'b', text: 'Azure Synapse Analytics (Serverless SQL Pool)', icon: 'Layers' },
      { id: 'c', text: 'Azure Files', icon: 'FolderOpen' },
      { id: 'd', text: 'Power BI Desktop only', icon: 'BarChart3' },
    ],
    correctId: 'b',
    explanation:
      'Synapse Serverless SQL Pool can run T-SQL queries directly over files in the data lake (CSV, Parquet, JSON) — no loading or copying required.',
  },
  {
    scenario:
      'A data team wants to transform raw data through Bronze (raw), Silver (cleansed), and Gold (business-ready) layers. What is this pattern called?',
    options: [
      { id: 'a', text: 'ETL Pipeline', icon: 'GitBranch' },
      { id: 'b', text: 'Medallion Architecture', icon: 'Medal' },
      { id: 'c', text: 'Lambda Architecture', icon: 'Lambda' },
      { id: 'd', text: 'Star Schema', icon: 'Star' },
    ],
    correctId: 'b',
    explanation:
      'Medallion Architecture organizes data into Bronze (raw), Silver (cleansed/conformed), and Gold (curated/aggregated) layers — each improving data quality.',
  },
  {
    scenario:
      'A retail company needs near-real-time fraud detection on transactions as they happen — not batch-processed hourly. What processing pattern?',
    options: [
      { id: 'a', text: 'Batch processing with Azure Data Factory', icon: 'Boxes' },
      { id: 'b', text: 'Stream processing with Azure Stream Analytics', icon: 'Radio' },
      { id: 'c', text: 'Nightly SQL stored procedures', icon: 'Moon' },
      { id: 'd', text: 'Power BI scheduled refresh', icon: 'BarChart3' },
    ],
    correctId: 'b',
    explanation:
      'Stream processing handles data continuously as it arrives. Azure Stream Analytics can evaluate fraud rules on each event in real time.',
  },
  {
    scenario:
      'A business analyst wants to create an interactive dashboard from a published dataset, sharing it with their team in a workspace. Which tool?',
    options: [
      { id: 'a', text: 'Azure Data Factory', icon: 'Factory' },
      { id: 'b', text: 'Power BI Service', icon: 'BarChart3' },
      { id: 'c', text: 'Azure Synapse Spark Pool', icon: 'Flame' },
      { id: 'd', text: 'Azure CLI', icon: 'Terminal' },
    ],
    correctId: 'b',
    explanation:
      'Power BI Service lets analysts build reports from datasets, publish them to workspaces, and share interactive dashboards with their team.',
  },
];

export const dp900FinalAssessmentQuestions: ScenarioQuestion[] = [
  {
    scenario:
      'Which data type is best described as "has a defined schema with rows and columns, enforces data types, and supports SQL queries"?',
    options: [
      { id: 'a', text: 'Unstructured data', icon: 'FileVideo' },
      { id: 'b', text: 'Semi-structured data (JSON)', icon: 'Braces' },
      { id: 'c', text: 'Structured (relational) data', icon: 'Table' },
      { id: 'd', text: 'Binary blobs', icon: 'Binary' },
    ],
    correctId: 'c',
    explanation:
      'Structured data lives in tables with predefined schemas, enforces column types, and is queried using SQL — the classic relational model.',
  },
  {
    scenario:
      'Which ACID property guarantees that once a transaction is committed, it survives even a power failure?',
    options: [
      { id: 'a', text: 'Atomicity', icon: 'Atom' },
      { id: 'b', text: 'Consistency', icon: 'CheckCircle' },
      { id: 'c', text: 'Isolation', icon: 'Lock' },
      { id: 'd', text: 'Durability', icon: 'HardDrive' },
    ],
    correctId: 'd',
    explanation:
      'Durability guarantees committed transactions are permanently saved — surviving crashes, power failures, and restarts. The data is written to persistent storage.',
  },
  {
    scenario:
      'A web application stores user profiles as JSON documents where each profile may have different fields. Which Azure service fits best?',
    options: [
      { id: 'a', text: 'Azure SQL Database', icon: 'Database' },
      { id: 'b', text: 'Azure Cosmos DB (SQL API)', icon: 'Globe' },
      { id: 'c', text: 'Azure Files', icon: 'FolderOpen' },
      { id: 'd', text: 'Azure Queue Storage', icon: 'ListOrdered' },
    ],
    correctId: 'b',
    explanation:
      'Cosmos DB SQL API stores JSON documents with flexible schemas. Different profiles can have different fields without migrations.',
  },
  {
    scenario:
      'What is the key difference between a data lake and a data warehouse?',
    options: [
      { id: 'a', text: 'Data lakes are smaller than warehouses', icon: 'Shrink' },
      { id: 'b', text: 'Data lakes store raw/unstructured data at scale; warehouses store structured, transformed data', icon: 'ArrowsLeftRight' },
      { id: 'c', text: 'Data lakes require SQL; warehouses do not', icon: 'Code' },
      { id: 'd', text: 'They are the same thing', icon: 'Equals' },
    ],
    correctId: 'b',
    explanation:
      'A data lake holds raw, unstructured, or semi-structured data at massive scale (files, blobs). A data warehouse stores structured, transformed data optimized for SQL queries.',
  },
  {
    scenario:
      'In ETL, when does the transformation happen relative to loading the data into the warehouse?',
    options: [
      { id: 'a', text: 'After loading (transform in the warehouse)', icon: 'ArrowDown' },
      { id: 'b', text: 'Before loading (transform in a staging area)', icon: 'ArrowUp' },
      { id: 'c', text: 'Transformation is not part of ETL', icon: 'X' },
      { id: 'd', text: 'During the query, not the load', icon: 'Search' },
    ],
    correctId: 'b',
    explanation:
      'ETL = Extract, Transform, Load. Transformation occurs in a staging area before the data is loaded into the target. ELT transforms after loading, inside the target system.',
  },
  {
    scenario:
      'Which Azure service is the primary orchestration tool for building data pipelines with scheduled activities?',
    options: [
      { id: 'a', text: 'Azure Data Factory', icon: 'Factory' },
      { id: 'b', text: 'Power BI', icon: 'BarChart3' },
      { id: 'c', text: 'Azure SQL Database', icon: 'Database' },
      { id: 'd', text: 'Azure Key Vault', icon: 'Lock' },
    ],
    correctId: 'a',
    explanation:
      'Azure Data Factory is a cloud-based data orchestration service. It builds pipelines that extract, transform, and load data on schedules or triggers.',
  },
  {
    scenario:
      'In Medallion Architecture, what does the Silver layer contain?',
    options: [
      { id: 'a', text: 'Raw, unprocessed data', icon: 'Box' },
      { id: 'b', text: 'Cleansed, conformed, and filtered data', icon: 'Sparkles' },
      { id: 'c', text: 'Business-ready aggregated tables', icon: 'Medal' },
      { id: 'd', text: 'Archived data only', icon: 'Archive' },
    ],
    correctId: 'b',
    explanation:
      'Bronze = raw ingestion. Silver = cleansed, conformed, filtered (rules applied, duplicates removed). Gold = aggregated, business-ready tables for reporting.',
  },
  {
    scenario:
      'A company wants to visualize key metrics from multiple sources in a single interactive view that auto-refreshes. Which Power BI artifact?',
    options: [
      { id: 'a', text: 'A dataset', icon: 'Database' },
      { id: 'b', text: 'A dashboard', icon: 'LayoutDashboard' },
      { id: 'c', text: 'A dataflow', icon: 'Waves' },
      { id: 'd', text: 'A workspace', icon: 'FolderOpen' },
    ],
    correctId: 'b',
    explanation:
      'A Power BI dashboard is a single page that surfaces visuals from multiple reports and datasets. Tiles auto-refresh when underlying data updates.',
  },
  {
    scenario:
      'Which Azure service provides a unified analytics platform that combines data ingestion, big data processing (Spark), data warehousing (SQL), and visualization integration?',
    options: [
      { id: 'a', text: 'Azure Data Factory only', icon: 'Factory' },
      { id: 'b', text: 'Azure Synapse Analytics', icon: 'Layers' },
      { id: 'c', text: 'Azure SQL Database', icon: 'Database' },
      { id: 'd', text: 'Power BI Premium', icon: 'BarChart3' },
    ],
    correctId: 'b',
    explanation:
      'Synapse Analytics unifies data pipelines (via Data Factory integration), Spark pools for big data, SQL pools for warehousing, and connects directly to Power BI.',
  },
  {
    scenario:
      'Batch processing is best suited for which scenario?',
    options: [
      { id: 'a', text: 'Real-time fraud detection on credit card swipes', icon: 'CreditCard' },
      { id: 'b', text: 'Processing millions of daily logs overnight to generate a morning report', icon: 'Moon' },
      { id: 'c', text: 'Live sports score updates to a mobile app', icon: 'Trophy' },
      { id: 'd', text: 'IoT sensor alerts that must trigger in under 1 second', icon: 'Radio' },
    ],
    correctId: 'b',
    explanation:
      'Batch processing handles large volumes of data at scheduled intervals. Overnight log processing for a morning report is a classic batch use case — no real-time requirement.',
  },
];
