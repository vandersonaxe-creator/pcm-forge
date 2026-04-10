"use client";

import { useEffect } from "react";
import { useInstrumentsByCalibrationStatus } from "@/hooks/use-calibrations";
import {
  CalibrationPanel,
  CalibrationsPageHeader,
} from "@/components/calibrations/calibration-panel";

export default function CalibrationsPanelPage() {
  const { instruments, loading, refetch } = useInstrumentsByCalibrationStatus();

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="flex flex-col min-h-0 w-full max-w-full">
      <CalibrationsPageHeader />
      <CalibrationPanel instruments={instruments} loading={loading} />
    </div>
  );
}
