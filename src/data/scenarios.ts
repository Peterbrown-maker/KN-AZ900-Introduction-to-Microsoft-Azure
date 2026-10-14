export const identityScenarioQuestions = [
  {
    scenario: 'A partner organization needs their users to access a specific app in your Azure tenant using their own credentials.',
    options: [
      { id: 'a', text: 'B2B Collaboration', icon: 'Handshake' },
      { id: 'b', text: 'B2C (External ID)', icon: 'Users' },
      { id: 'c', text: 'Entra Domain Services', icon: 'Building' },
      { id: 'd', text: 'Azure VPN Gateway', icon: 'Lock' },
    ],
    correctId: 'a',
    explanation: 'B2B Collaboration invites partner users as guests. They authenticate with their own identity provider and access your resources.',
  },
  {
    scenario: 'You want customers to sign in to your mobile app using Google or Facebook accounts.',
    options: [
      { id: 'a', text: 'B2B Collaboration', icon: 'Handshake' },
      { id: 'b', text: 'External ID (B2C)', icon: 'Users' },
      { id: 'c', text: 'Windows Hello', icon: 'ScanFace' },
      { id: 'd', text: 'FIDO2 Security Keys', icon: 'Usb' },
    ],
    correctId: 'b',
    explanation: 'External ID (formerly B2C) is designed for customer-facing applications with social identity provider support.',
  },
  {
    scenario: 'You want to eliminate passwords entirely for your employees. Which is the strongest option?',
    options: [
      { id: 'a', text: 'SMS codes', icon: 'MessageSquare' },
      { id: 'b', text: 'FIDO2 Security Keys', icon: 'Usb' },
      { id: 'c', text: 'Email verification', icon: 'Mail' },
      { id: 'd', text: 'Security questions', icon: 'HelpCircle' },
    ],
    correctId: 'b',
    explanation: 'FIDO2 security keys are hardware-based, phishing-resistant, and represent the gold standard for passwordless authentication.',
  },
  {
    scenario: 'A user logs in with a password. What additional factor would make this MFA?',
    options: [
      { id: 'a', text: 'A longer password', icon: 'Key' },
      { id: 'b', text: 'A code from Microsoft Authenticator', icon: 'Smartphone' },
      { id: 'c', text: 'A security question', icon: 'HelpCircle' },
      { id: 'd', text: 'A second password', icon: 'Key' },
    ],
    correctId: 'b',
    explanation: 'MFA requires factors from different categories: something you know (password) + something you have (authenticator app code).',
  },
];

export const securityScenarioQuestions = [
  {
    scenario: 'An employee tries to access a production database from an unmanaged device in a foreign country. What should Conditional Access do?',
    options: [
      { id: 'a', text: 'Allow access — they have valid credentials', icon: 'Check' },
      { id: 'b', text: 'Block access or require MFA', icon: 'ShieldAlert' },
      { id: 'c', text: 'Delete the user account', icon: 'Trash2' },
      { id: 'd', text: 'Send an email notification only', icon: 'Mail' },
    ],
    correctId: 'b',
    explanation: 'Conditional Access evaluates risk conditions (unmanaged device, unknown location). It can block or require MFA based on your policies.',
  },
  {
    scenario: 'Your application needs to store API keys and connection strings securely. Where should they go?',
    options: [
      { id: 'a', text: 'In source code', icon: 'FileCode' },
      { id: 'b', text: 'Azure Key Vault', icon: 'Lock' },
      { id: 'c', text: 'In a Blob Storage container', icon: 'FileVideo' },
      { id: 'd', text: 'In an environment variable on a VM', icon: 'Server' },
    ],
    correctId: 'b',
    explanation: 'Key Vault is designed for secrets. Applications authenticate to it and retrieve secrets at runtime — never in source code.',
  },
  {
    scenario: 'You want to apply the principle of "never trust, always verify." Which security model is this?',
    options: [
      { id: 'a', text: 'Defense in Depth', icon: 'Shield' },
      { id: 'b', text: 'Zero Trust', icon: 'ShieldCheck' },
      { id: 'c', text: 'RBAC', icon: 'Users' },
      { id: 'd', text: 'Encryption at Rest', icon: 'HardDrive' },
    ],
    correctId: 'b',
    explanation: 'Zero Trust means no implicit trust based on location or network. Every request must be authenticated, authorized, and encrypted.',
  },
  {
    scenario: 'Which encryption protects data while it travels across the network?',
    options: [
      { id: 'a', text: 'Encryption at Rest', icon: 'HardDrive' },
      { id: 'b', text: 'Encryption in Transit (TLS)', icon: 'ArrowLeftRight' },
      { id: 'c', text: 'Azure Key Vault', icon: 'Lock' },
      { id: 'd', text: 'Azure Policy', icon: 'FileCheck' },
    ],
    correctId: 'b',
    explanation: 'Encryption in transit (TLS/SSL) protects data while it moves between client and server, preventing eavesdropping.',
  },
];

export const governanceScenarioQuestions = [
  {
    scenario: 'Your team accidentally deleted a production database. How do you prevent this in the future?',
    options: [
      { id: 'a', text: 'Enable Azure Policy', icon: 'FileCheck' },
      { id: 'b', text: 'Apply a CanNotDelete resource lock', icon: 'Lock' },
      { id: 'c', text: 'Create a management group', icon: 'Network' },
      { id: 'd', text: 'Enable MFA', icon: 'Smartphone' },
    ],
    correctId: 'b',
    explanation: 'A CanNotDelete lock prevents anyone from deleting the resource — even an owner — until the lock is explicitly removed.',
  },
  {
    scenario: 'You need to ensure all storage accounts in your organization have encryption enabled. Which tool?',
    options: [
      { id: 'a', text: 'Resource Lock', icon: 'Lock' },
      { id: 'b', text: 'Azure Policy', icon: 'FileCheck' },
      { id: 'c', text: 'Azure Key Vault', icon: 'Lock' },
      { id: 'd', text: 'Azure Advisor', icon: 'Lightbulb' },
    ],
    correctId: 'b',
    explanation: 'Azure Policy can audit existing resources and enforce rules on new ones — like requiring encryption on all storage accounts.',
  },
  {
    scenario: 'You have 50 subscriptions and need to apply the same policy to all of them. What is the most efficient approach?',
    options: [
      { id: 'a', text: 'Apply the policy to each subscription individually', icon: 'Repeat' },
      { id: 'b', text: 'Create a management group, add all subscriptions, apply policy at the group level', icon: 'Layers' },
      { id: 'c', text: 'Email each team to apply the policy', icon: 'Mail' },
      { id: 'd', text: 'Use Azure Monitor', icon: 'Activity' },
    ],
    correctId: 'b',
    explanation: 'Management groups let you apply policies once at the top level, and they cascade to all subscriptions below — governance at scale.',
  },
];

export const managementScenarioQuestions = [
  {
    scenario: 'You want to get personalized recommendations for cost optimization, security, and performance. Which service?',
    options: [
      { id: 'a', text: 'Azure Monitor', icon: 'Activity' },
      { id: 'b', text: 'Azure Advisor', icon: 'Lightbulb' },
      { id: 'c', text: 'Azure Service Health', icon: 'HeartPulse' },
      { id: 'd', text: 'Azure CLI', icon: 'Terminal' },
    ],
    correctId: 'b',
    explanation: 'Azure Advisor analyzes your resources and provides personalized recommendations across cost, security, reliability, and performance.',
  },
  {
    scenario: 'You need to set an alert when your VM\'s CPU exceeds 80% for 10 minutes. Which service?',
    options: [
      { id: 'a', text: 'Azure Advisor', icon: 'Lightbulb' },
      { id: 'b', text: 'Azure Monitor', icon: 'Activity' },
      { id: 'c', text: 'Azure Service Health', icon: 'HeartPulse' },
      { id: 'd', text: 'Azure Status page', icon: 'Globe' },
    ],
    correctId: 'b',
    explanation: 'Azure Monitor collects metrics and lets you set alert rules that trigger notifications when thresholds are met.',
  },
  {
    scenario: 'You want to deploy the same set of Azure resources repeatedly and consistently across environments. What should you use?',
    options: [
      { id: 'a', text: 'Azure Portal', icon: 'LayoutDashboard' },
      { id: 'b', text: 'ARM Templates', icon: 'Layers' },
      { id: 'c', text: 'Azure Advisor', icon: 'Lightbulb' },
      { id: 'd', text: 'Azure CDN', icon: 'Globe' },
    ],
    correctId: 'b',
    explanation: 'ARM templates (JSON) define infrastructure as code. You can deploy the same environment repeatedly and consistently.',
  },
];

export const costOptimizationQuestions = [
  {
    scenario: 'You have a VM running 24/7 for a predictable workload. How can you save up to 72%?',
    options: [
      { id: 'a', text: 'Switch to a smaller VM size', icon: 'Maximize' },
      { id: 'b', text: 'Purchase a 1-year reservation', icon: 'CalendarCheck' },
      { id: 'c', text: 'Move to a different region', icon: 'MapPin' },
      { id: 'd', text: 'Enable Azure CDN', icon: 'Globe' },
    ],
    correctId: 'b',
    explanation: 'Reservations offer up to 72% discount compared to pay-as-you-go for steady, predictable workloads by committing to 1 or 3 years.',
  },
  {
    scenario: 'You have a dev VM that is only used during business hours. What is the simplest way to reduce costs?',
    options: [
      { id: 'a', text: 'Delete the VM every night', icon: 'Trash2' },
      { id: 'b', text: 'Stop (deallocate) the VM when not in use', icon: 'Power' },
      { id: 'c', text: 'Move it to a cheaper region', icon: 'MapPin' },
      { id: 'd', text: 'Enable Azure Advisor', icon: 'Lightbulb' },
    ],
    correctId: 'b',
    explanation: 'Stopping (deallocating) a VM stops compute charges. You only pay for the attached disks. This is the simplest way to save on dev VMs.',
  },
  {
    scenario: 'You want to track spending and set budget alerts across your subscriptions. Which tool?',
    options: [
      { id: 'a', text: 'Azure Pricing Calculator', icon: 'Calculator' },
      { id: 'b', text: 'Azure Cost Management', icon: 'PieChart' },
      { id: 'c', text: 'Azure Advisor', icon: 'Lightbulb' },
      { id: 'd', text: 'Azure Monitor', icon: 'Activity' },
    ],
    correctId: 'b',
    explanation: 'Cost Management lets you analyze spending, set budgets, create alerts, and download reports across all your subscriptions.',
  },
];

export const reliabilityScenarioQuestions = [
  {
    scenario: 'Your app needs 99.99% uptime. How should you deploy your VMs?',
    options: [
      { id: 'a', text: 'A single VM in one region', icon: 'Server' },
      { id: 'b', text: 'Multiple VMs across availability zones', icon: 'Layers' },
      { id: 'c', text: 'A single VM with a larger size', icon: 'Maximize' },
      { id: 'd', text: 'Multiple VMs in the same datacenter', icon: 'Server' },
    ],
    correctId: 'b',
    explanation: '99.99% SLA requires deployment across availability zones. If one zone fails, the others continue serving traffic.',
  },
  {
    scenario: 'Your app uses a VM (99.9%) and a SQL Database (99.99%). What is the approximate composite SLA?',
    options: [
      { id: 'a', text: '99.99%', icon: 'Gauge' },
      { id: 'b', text: '99.9%', icon: 'Gauge' },
      { id: 'c', text: '99.89%', icon: 'Gauge' },
      { id: 'd', text: '99.999%', icon: 'Gauge' },
    ],
    correctId: 'c',
    explanation: 'Composite SLA = 0.999 × 0.9999 = 0.9989, or about 99.89%. Multiple dependencies reduce overall availability.',
  },
  {
    scenario: 'Azure failed to meet the SLA for your service. What can you request?',
    options: [
      { id: 'a', text: 'A full refund', icon: 'BadgeDollarSign' },
      { id: 'b', text: 'Service credits', icon: 'BadgeDollarSign' },
      { id: 'c', text: 'Free resources for a year', icon: 'Gift' },
      { id: 'd', text: 'Nothing — SLAs are not binding', icon: 'X' },
    ],
    correctId: 'b',
    explanation: 'If Azure fails to meet the committed SLA, you can request service credits — a percentage of your monthly fee credited back.',
  },
];

export const dataArchitectureQuestions = [
  {
    scenario: 'You need a globally distributed database for a product catalog with flexible schemas and sub-ms latency. Which service?',
    options: [
      { id: 'a', text: 'Azure SQL Database', icon: 'Database' },
      { id: 'b', text: 'Azure Cosmos DB', icon: 'Globe' },
      { id: 'c', text: 'Azure Table Storage', icon: 'Table' },
      { id: 'd', text: 'Azure Blob Storage', icon: 'FileVideo' },
    ],
    correctId: 'b',
    explanation: 'Cosmos DB provides global distribution, flexible schemas, and sub-millisecond latency — ideal for a global product catalog.',
  },
  {
    scenario: 'You are building a banking app that requires ACID transactions and strict data integrity. Which database?',
    options: [
      { id: 'a', text: 'Azure Cosmos DB', icon: 'Globe' },
      { id: 'b', text: 'Azure SQL Database', icon: 'Database' },
      { id: 'c', text: 'Azure Blob Storage', icon: 'FileVideo' },
      { id: 'd', text: 'Azure Queue Storage', icon: 'ListOrdered' },
    ],
    correctId: 'b',
    explanation: 'Azure SQL Database enforces ACID transactions, foreign keys, and strict schemas — essential for financial applications.',
  },
  {
    scenario: 'You need to store millions of user-uploaded images with different access frequencies. Which service and configuration?',
    options: [
      { id: 'a', text: 'Blob Storage with access tiers (Hot/Cool/Archive)', icon: 'FileVideo' },
      { id: 'b', text: 'Azure SQL Database', icon: 'Database' },
      { id: 'c', text: 'Cosmos DB', icon: 'Globe' },
      { id: 'd', text: 'Queue Storage', icon: 'ListOrdered' },
    ],
    correctId: 'a',
    explanation: 'Blob Storage is ideal for unstructured image data. Access tiers let you optimize cost: Hot for frequent, Archive for rare access.',
  },
];

export const storageDecisionQuestions = [
  {
    scenario: 'You need to share files across multiple Windows VMs using SMB protocol. Which storage service?',
    options: [
      { id: 'a', text: 'Blob Storage', icon: 'FileVideo' },
      { id: 'b', text: 'Azure Files', icon: 'FolderOpen' },
      { id: 'c', text: 'Queue Storage', icon: 'ListOrdered' },
      { id: 'd', text: 'Table Storage', icon: 'Table' },
    ],
    correctId: 'b',
    explanation: 'Azure Files provides managed file shares accessible via SMB — like a network drive. Multiple VMs can mount the same share.',
  },
  {
    scenario: 'You need to decouple application components with messages that wait to be processed. Which service?',
    options: [
      { id: 'a', text: 'Blob Storage', icon: 'FileVideo' },
      { id: 'b', text: 'Azure Files', icon: 'FolderOpen' },
      { id: 'c', text: 'Queue Storage', icon: 'ListOrdered' },
      { id: 'd', text: 'Table Storage', icon: 'Table' },
    ],
    correctId: 'c',
    explanation: 'Queue Storage stores messages that wait to be processed, decoupling components for asynchronous workflows.',
  },
  {
    scenario: 'You need to store large video files with protection against a regional outage. Which redundancy option?',
    options: [
      { id: 'a', text: 'LRS', icon: 'Copy' },
      { id: 'b', text: 'ZRS', icon: 'Layers' },
      { id: 'c', text: 'GRS', icon: 'Globe' },
      { id: 'd', text: 'None — just use one copy', icon: 'X' },
    ],
    correctId: 'c',
    explanation: 'GRS replicates data to a paired region, protecting against regional outages. For even more durability, GZRS adds zone redundancy.',
  },
];

export const serviceSelectionQuestions = [
  {
    scenario: 'I need to run code whenever a file is uploaded.',
    options: [
      { id: 'a', text: 'Virtual Machine', icon: 'Server' },
      { id: 'b', text: 'Azure Functions', icon: 'Zap' },
      { id: 'c', text: 'Azure Files', icon: 'FolderOpen' },
      { id: 'd', text: 'Load Balancer', icon: 'Split' },
    ],
    correctId: 'b',
    explanation: 'Azure Functions is serverless compute designed to run code in response to events like file uploads — no servers to manage.',
  },
  {
    scenario: 'I need to cache video content closer to users worldwide.',
    options: [
      { id: 'a', text: 'Azure CDN', icon: 'Globe' },
      { id: 'b', text: 'ExpressRoute', icon: 'Cable' },
      { id: 'c', text: 'Azure SQL', icon: 'Database' },
      { id: 'd', text: 'Azure VPN Gateway', icon: 'Lock' },
    ],
    correctId: 'a',
    explanation: 'Azure CDN caches content at edge locations worldwide, reducing latency for global users.',
  },
  {
    scenario: 'I need a private, dedicated connection to Azure with consistent low latency.',
    options: [
      { id: 'a', text: 'VPN Gateway', icon: 'Lock' },
      { id: 'b', text: 'ExpressRoute', icon: 'Cable' },
      { id: 'c', text: 'Azure CDN', icon: 'Globe' },
      { id: 'd', text: 'Azure DNS', icon: 'Globe' },
    ],
    correctId: 'b',
    explanation: 'ExpressRoute provides a private, dedicated connection that bypasses the internet — consistent low latency and reliable bandwidth.',
  },
  {
    scenario: 'I need to store secrets like API keys and connection strings.',
    options: [
      { id: 'a', text: 'Azure Key Vault', icon: 'Lock' },
      { id: 'b', text: 'Blob Storage', icon: 'FileVideo' },
      { id: 'c', text: 'Azure Files', icon: 'FolderOpen' },
      { id: 'd', text: 'Queue Storage', icon: 'ListOrdered' },
    ],
    correctId: 'a',
    explanation: 'Azure Key Vault is specifically designed for storing and managing secrets, keys, and certificates securely.',
  },
  {
    scenario: 'I need to host a web application without managing the operating system.',
    options: [
      { id: 'a', text: 'Virtual Machine', icon: 'Server' },
      { id: 'b', text: 'Azure App Service', icon: 'Globe' },
      { id: 'c', text: 'Azure Kubernetes Service', icon: 'Boxes' },
      { id: 'd', text: 'Azure Container Instances', icon: 'Package' },
    ],
    correctId: 'b',
    explanation: 'Azure App Service is a fully managed PaaS platform for web applications — no OS management required.',
  },
  {
    scenario: 'I need to prevent accidental deletion of a production resource.',
    options: [
      { id: 'a', text: 'Azure Policy', icon: 'FileCheck' },
      { id: 'b', text: 'Resource Lock (CanNotDelete)', icon: 'Lock' },
      { id: 'c', text: 'Azure Key Vault', icon: 'Lock' },
      { id: 'd', text: 'Azure Monitor', icon: 'Activity' },
    ],
    correctId: 'b',
    explanation: 'A CanNotDelete resource lock prevents anyone from deleting the resource until the lock is explicitly removed.',
  },
  {
    scenario: 'I need to organize 200 resources across 3 projects under one billing account.',
    options: [
      { id: 'a', text: 'Three subscriptions', icon: 'CreditCard' },
      { id: 'b', text: 'Three resource groups in one subscription', icon: 'FolderTree' },
      { id: 'c', text: 'Three management groups', icon: 'Network' },
      { id: 'd', text: 'Three storage accounts', icon: 'Database' },
    ],
    correctId: 'b',
    explanation: 'Since billing is shared, one subscription is appropriate. Resource groups organize resources by project within that subscription.',
  },
  {
    scenario: 'I need to ensure only encrypted storage accounts are created in my subscription.',
    options: [
      { id: 'a', text: 'Resource Lock', icon: 'Lock' },
      { id: 'b', text: 'Azure Policy', icon: 'FileCheck' },
      { id: 'c', text: 'Azure Key Vault', icon: 'Lock' },
      { id: 'd', text: 'Azure Advisor', icon: 'Lightbulb' },
    ],
    correctId: 'b',
    explanation: 'Azure Policy can enforce that all new storage accounts must have encryption enabled — blocking non-compliant resources.',
  },
];

export const finalAssessmentQuestions = [
  {
    scenario: 'A startup wants to deploy a web app quickly without managing servers. They need auto-scaling and built-in TLS. Which Azure service is the best fit?',
    options: [
      { id: 'a', text: 'Virtual Machine with Load Balancer' },
      { id: 'b', text: 'Azure App Service' },
      { id: 'c', text: 'Azure Kubernetes Service' },
      { id: 'd', text: 'Azure Container Instances' },
    ],
    correctId: 'b',
    explanation: 'Azure App Service is a fully managed PaaS offering with auto-scaling, built-in TLS, and no OS management — ideal for a startup wanting speed and simplicity.',
  },
  {
    scenario: 'A healthcare company stores patient records in Azure. They need to ensure data survives even a complete regional outage. Which storage redundancy option should they choose?',
    options: [
      { id: 'a', text: 'LRS' },
      { id: 'b', text: 'ZRS' },
      { id: 'c', text: 'GZRS' },
      { id: 'd', text: 'No redundancy needed' },
    ],
    correctId: 'c',
    explanation: 'GZRS combines zone redundancy in the primary region with geo-redundancy to a paired region — protecting against both datacenter and regional failures. Perfect for critical healthcare data.',
  },
  {
    scenario: 'A company has 1000 employees who need to access 50 different SaaS applications. They want users to sign in once and access all apps. Which Entra ID feature should they use?',
    options: [
      { id: 'a', text: 'B2B Collaboration' },
      { id: 'b', text: 'Single Sign-On (SSO)' },
      { id: 'c', text: 'Entra Domain Services' },
      { id: 'd', text: 'Azure VPN Gateway' },
    ],
    correctId: 'b',
    explanation: 'Single Sign-On lets users authenticate once and access multiple applications without re-entering credentials — improving both security and user experience.',
  },
  {
    scenario: 'A global e-commerce platform needs to process thousands of orders per minute during sales events. They want to decouple order intake from processing. Which Azure services should they combine?',
    options: [
      { id: 'a', text: 'Azure SQL + Azure Monitor' },
      { id: 'b', text: 'Queue Storage + Azure Functions' },
      { id: 'c', text: 'Azure CDN + Load Balancer' },
      { id: 'd', text: 'ExpressRoute + Azure DNS' },
    ],
    correctId: 'b',
    explanation: 'Queue Storage holds incoming orders, and Azure Functions process them asynchronously. This decoupling prevents overload during traffic spikes.',
  },
  {
    scenario: 'A company needs to run a legacy application that requires domain join, LDAP, and Kerberos authentication in the cloud. They do not want to deploy domain controllers. Which service should they use?',
    options: [
      { id: 'a', text: 'Azure AD B2C' },
      { id: 'b', text: 'Microsoft Entra Domain Services' },
      { id: 'c', text: 'Azure Key Vault' },
      { id: 'd', text: 'Azure Policy' },
    ],
    correctId: 'b',
    explanation: 'Entra Domain Services provides managed domain services (domain join, LDAP, Kerberos) without deploying or maintaining domain controllers.',
  },
  {
    scenario: 'An organization has 200 subscriptions and needs to enforce a policy that restricts VM deployment to only two regions. What is the most efficient approach?',
    options: [
      { id: 'a', text: 'Apply the policy to each subscription individually' },
      { id: 'b', text: 'Create a management group, add all subscriptions, apply the policy at the group level' },
      { id: 'c', text: 'Use Azure Monitor to detect non-compliant VMs' },
      { id: 'd', text: 'Email each team to follow the rule' },
    ],
    correctId: 'b',
    explanation: 'Management groups let you apply a policy once at the top level, and it cascades to all 200 subscriptions below — governance at scale.',
  },
  {
    scenario: 'A company\'s web app has a 99.9% SLA for compute and a 99.99% SLA for its database. They are considering adding a queue service with 99.9% SLA. What will happen to the composite SLA?',
    options: [
      { id: 'a', text: 'It will increase — more services means more reliability' },
      { id: 'b', text: 'It will decrease — each additional dependency reduces overall availability' },
      { id: 'c', text: 'It will stay the same' },
      { id: 'd', text: 'It will become 99.999%' },
    ],
    correctId: 'b',
    explanation: 'Composite SLA is the product of individual SLAs: 0.999 × 0.9999 × 0.999 = ~99.79%. Each additional dependency reduces overall availability.',
  },
  {
    scenario: 'A user signs in from a known location on a managed device but attempts to access a highly sensitive application. Conditional Access policy evaluates: location=trusted, device=compliant, app=sensitive, risk=medium. What is the likely decision?',
    options: [
      { id: 'a', text: 'Allow without any additional checks' },
      { id: 'b', text: 'Require MFA — the app is sensitive and risk is medium' },
      { id: 'c', text: 'Block completely — risk is too high' },
      { id: 'd', text: 'Delete the user account' },
    ],
    correctId: 'b',
    explanation: 'Conditional Access evaluates all conditions. Trusted location and compliant device are good, but sensitive app + medium risk likely triggers MFA as an additional verification step.',
  },
  {
    scenario: 'Which of the following is TRUE about Azure Storage accounts?',
    options: [
      { id: 'a', text: 'Queue Storage can be used as a relational database' },
      { id: 'b', text: 'Blob Storage supports access tiers: Hot, Cool, and Archive' },
      { id: 'c', text: 'Azure Files requires a VM to access files' },
      { id: 'd', text: 'LRS protects against regional outages' },
    ],
    correctId: 'b',
    explanation: 'Blob Storage offers three access tiers: Hot (frequent access), Cool (infrequent), and Archive (rare access, lowest cost). Queue Storage is for messages, not databases. LRS only protects within a single datacenter.',
  },
  {
    scenario: 'A company wants to build a machine learning model to predict customer churn. They have historical data and need a cloud service to train and deploy the model. Which Azure service should they use?',
    options: [
      { id: 'a', text: 'Azure Cosmos DB' },
      { id: 'b', text: 'Azure Machine Learning' },
      { id: 'c', text: 'Azure CDN' },
      { id: 'd', text: 'Azure Key Vault' },
    ],
    correctId: 'b',
    explanation: 'Azure Machine Learning is a cloud platform for building, training, and deploying ML models. It provides tools for the entire ML lifecycle.',
  },
];
