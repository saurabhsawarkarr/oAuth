import React from 'react';
import { VerificationStatus } from '@/types/guide';
import { CheckCircle2, FileText, CheckSquare, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';

interface EvidenceBadgeProps {
  status: VerificationStatus;
  size?: 'sm' | 'md';
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({ status, size = 'md' }) => {
  const getBadgeConfig = (status: VerificationStatus) => {
    switch (status) {
      case 'Tested':
        return {
          className: 'tested',
          icon: <CheckCircle2 size={size === 'sm' ? 12 : 14} />,
          label: 'Tested',
        };
      case 'Documented':
        return {
          className: 'documented',
          icon: <FileText size={size === 'sm' ? 12 : 14} />,
          label: 'Documented',
        };
      case 'Configuration Checked':
        return {
          className: 'checked',
          icon: <CheckSquare size={size === 'sm' ? 12 : 14} />,
          label: 'Config Checked',
        };
      case 'Estimated':
        return {
          className: 'estimated',
          icon: <Clock size={size === 'sm' ? 12 : 14} />,
          label: 'Estimated',
        };
      case 'Unverified':
        return {
          className: 'unverified',
          icon: <AlertTriangle size={size === 'sm' ? 12 : 14} />,
          label: 'Unverified',
        };
      case 'Blocked':
        return {
          className: 'blocked',
          icon: <ShieldAlert size={size === 'sm' ? 12 : 14} />,
          label: 'Blocked (Human Action)',
        };
      default:
        return {
          className: 'unverified',
          icon: <AlertTriangle size={size === 'sm' ? 12 : 14} />,
          label: status,
        };
    }
  };

  const config = getBadgeConfig(status);

  return (
    <span className={`evidence-badge ${config.className}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
