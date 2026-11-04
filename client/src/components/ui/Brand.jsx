import { PanelsTopLeft } from 'lucide-react';

export function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark"><PanelsTopLeft size={19} aria-hidden="true" /></span>
      <span>AffixxMedia<small>Client workspace</small></span>
    </div>
  );
}
