import { lazy, Suspense } from 'react';
import type { InteractionKind } from '@/types/course';
import { ScenarioInteraction } from './ScenarioInteraction';
import {
  identityScenarioQuestions,
  securityScenarioQuestions,
  governanceScenarioQuestions,
  managementScenarioQuestions,
  costOptimizationQuestions,
  reliabilityScenarioQuestions,
  dataArchitectureQuestions,
  storageDecisionQuestions,
} from '@/data/scenarios';

const LoadBalancerSim = lazy(() => import('./LoadBalancerSim').then(m => ({ default: m.LoadBalancerSim })));
const AvailabilityZoneSim = lazy(() => import('./AvailabilityZoneSim').then(m => ({ default: m.AvailabilityZoneSim })));
const MFASim = lazy(() => import('./MFASim').then(m => ({ default: m.MFASim })));
const ZeroTrustGate = lazy(() => import('./ZeroTrustGate').then(m => ({ default: m.ZeroTrustGate })));
const RBACGame = lazy(() => import('./RBACGame').then(m => ({ default: m.RBACGame })));
const EncryptionViz = lazy(() => import('./EncryptionViz').then(m => ({ default: m.EncryptionViz })));
const DefenseInDepth = lazy(() => import('./DefenseInDepth').then(m => ({ default: m.DefenseInDepth })));
const StorageRedundancy = lazy(() => import('./StorageRedundancy').then(m => ({ default: m.StorageRedundancy })));
const QueuePressure = lazy(() => import('./QueuePressure').then(m => ({ default: m.QueuePressure })));
const BuildNetwork = lazy(() => import('./BuildNetwork').then(m => ({ default: m.BuildNetwork })));
const DragData = lazy(() => import('./DragData').then(m => ({ default: m.DragData })));
const ConditionalAccess = lazy(() => import('./ConditionalAccess').then(m => ({ default: m.ConditionalAccess })));
const KeyVault = lazy(() => import('./KeyVault').then(m => ({ default: m.KeyVault })));
const ServiceModelShift = lazy(() => import('./ServiceModelShift').then(m => ({ default: m.ServiceModelShift })));
const ResourceHierarchy = lazy(() => import('./ResourceHierarchy').then(m => ({ default: m.ResourceHierarchy })));
const VMFamilies = lazy(() => import('./VMFamilies').then(m => ({ default: m.VMFamilies })));
const ComputeChooser = lazy(() => import('./VMFamilies').then(m => ({ default: m.ComputeChooser })));
const RegionPairs = lazy(() => import('./RegionPairs').then(m => ({ default: m.RegionPairs })));
const SharedResponsibility = lazy(() => import('./SharedResponsibility').then(m => ({ default: m.SharedResponsibility })));
const SLACalculator = lazy(() => import('./SLACalculator').then(m => ({ default: m.SLACalculator })));
const PricingFactors = lazy(() => import('./PricingFactors').then(m => ({ default: m.PricingFactors })));
const ArchitectureStory = lazy(() => import('./ArchitectureStory').then(m => ({ default: m.ArchitectureStory })));
const AIvsML = lazy(() => import('./AIMLCompare').then(m => ({ default: m.AIvsML })));
const IoTEdge = lazy(() => import('./AIMLCompare').then(m => ({ default: m.IoTEdge })));
const ServiceSelection = lazy(() => import('./ServiceSelection').then(m => ({ default: m.ServiceSelection })));
const FinalAssessment = lazy(() => import('./FinalAssessment').then(m => ({ default: m.FinalAssessment })));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-azure-400/30 border-t-azure-400 rounded-full animate-spin" />
    </div>
  );
}

interface InteractionRouterProps {
  kind: InteractionKind;
  description?: string;
  onAssessmentComplete?: (score: number, total: number) => void;
}

export function InteractionRouter({ kind, onAssessmentComplete }: InteractionRouterProps) {
  const wrap = (component: React.ReactNode) => <Suspense fallback={<LoadingFallback />}>{component}</Suspense>;

  switch (kind) {
    case 'load-balancer':
      return wrap(<LoadBalancerSim />);
    case 'availability-zones':
      return wrap(<AvailabilityZoneSim />);
    case 'mfa':
      return wrap(<MFASim />);
    case 'zero-trust':
      return wrap(<ZeroTrustGate />);
    case 'rbac':
      return wrap(<RBACGame />);
    case 'encryption':
      return wrap(<EncryptionViz />);
    case 'defense-in-depth':
      return wrap(<DefenseInDepth />);
    case 'storage-redundancy':
      return wrap(<StorageRedundancy />);
    case 'queue-pressure':
      return wrap(<QueuePressure />);
    case 'build-network':
      return wrap(<BuildNetwork />);
    case 'drag-data':
      return wrap(<DragData />);
    case 'conditional-access':
      return wrap(<ConditionalAccess />);
    case 'key-vault':
      return wrap(<KeyVault />);
    case 'service-model-shift':
      return wrap(<ServiceModelShift />);
    case 'resource-hierarchy':
      return wrap(<ResourceHierarchy />);
    case 'vm-families':
      return wrap(<VMFamilies />);
    case 'region-pairs':
      return wrap(<RegionPairs />);
    case 'shared-responsibility':
      return wrap(<SharedResponsibility />);
    case 'sla-calculator':
      return wrap(<SLACalculator />);
    case 'pricing-factors':
      return wrap(<PricingFactors />);
    case 'compute-chooser':
      return wrap(<ComputeChooser />);
    case 'architecture-story':
      return wrap(<ArchitectureStory />);
    case 'service-selection':
      return wrap(<ServiceSelection />);
    case 'identity-scenario':
      return wrap(<ScenarioInteraction questions={identityScenarioQuestions} title="Identity Scenario" description="Apply identity concepts to real-world situations." />);
    case 'security-scenario':
      return wrap(<ScenarioInteraction questions={securityScenarioQuestions} title="Security Scenario" description="Choose the right Azure security service for each situation." />);
    case 'governance-scenario':
      return wrap(<ScenarioInteraction questions={governanceScenarioQuestions} title="Governance Scenario" description="Apply governance concepts to real-world situations." />);
    case 'management-scenario':
      return wrap(<ScenarioInteraction questions={managementScenarioQuestions} title="Management Scenario" description="Match management tasks to the right Azure tool." />);
    case 'cost-optimization':
      return wrap(<ScenarioInteraction questions={costOptimizationQuestions} title="Cost Optimization Scenario" description="Apply cost optimization strategies to real-world situations." />);
    case 'reliability-scenario':
      return wrap(<ScenarioInteraction questions={reliabilityScenarioQuestions} title="Reliability Scenario" description="Apply reliability and SLA concepts to real-world situations." />);
    case 'ai-ml-compare':
      return wrap(<AIvsML />);
    case 'iot-edge':
      return wrap(<IoTEdge />);
    case 'data-architecture':
      return wrap(<ScenarioInteraction questions={dataArchitectureQuestions} title="Data Architecture Scenario" description="Match data scenarios to the correct database service." />);
    case 'storage-decision':
      return wrap(<ScenarioInteraction questions={storageDecisionQuestions} title="Storage Decision Challenge" description="Match data scenarios to the correct storage service." />);
    case 'final-assessment':
      return wrap(<FinalAssessment onComplete={onAssessmentComplete} />);
    default:
      return (
        <div className="text-center py-12 text-gray-500">
          <p>This interaction is not yet available.</p>
        </div>
      );
  }
}
