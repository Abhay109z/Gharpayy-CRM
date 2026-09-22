/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Lead, AuditLog, MongoDbStatus } from './types.js';
import { NavigationHeader } from './components/NavigationHeader.js';
import { LeadsView } from './components/LeadsView.js';
import { MPowerCallModal } from './components/MPowerCallModal.js';
import { BookingFlowSplitView } from './components/BookingFlowSplitView.js';
import { MovementCareView } from './components/MovementCareView.js';
import { MovementOsView } from './components/MovementOsView.js';
import { ClosingDeskView } from './components/ClosingDeskView.js';
import { AdminMovementView } from './components/AdminMovementView.js';
import { AuditTrailDrawer } from './components/AuditTrailDrawer.js';
import { WalkthroughModal } from './components/WalkthroughModal.js';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const path = window.location.pathname;
    if (
      path === '/leads' ||
      path === '/movement-care' ||
      path === '/booking-flow-split' ||
      path === '/movement-os' ||
      path === '/closing' ||
      path === '/admin'
    ) {
      return path;
    }
    return '/leads';
  });

  const [activeOperator, setActiveOperator] = useState<string>('Aarav Sharma');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [dbStatus, setDbStatus] = useState<MongoDbStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Modals & Drawers state
  const [selectedLeadForCall, setSelectedLeadForCall] = useState<Lead | null>(null);
  const [selectedLeadIdForSplit, setSelectedLeadIdForSplit] = useState<string>('');
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState<boolean>(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState<boolean>(false);
  const [auditFilterLeadId, setAuditFilterLeadId] = useState<string>('');

  // Synchronize browser history & popstate
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      if (
        p === '/leads' ||
        p === '/movement-care' ||
        p === '/booking-flow-split' ||
        p === '/movement-os' ||
        p === '/closing' ||
        p === '/admin'
      ) {
        setCurrentPath(p);
      } else {
        setCurrentPath('/leads');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Fetch leads and audit trail from hosted backend
  const fetchAllData = async () => {
    try {
      const [leadsRes, auditRes, statusRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/audit-trail'),
        fetch('/api/db-status')
      ]);
      const leadsData = await leadsRes.json();
      const auditData = await auditRes.json();
      const statusData = await statusRes.json().catch(() => null);

      if (leadsData.leads) {
        setLeads(leadsData.leads);
      }
      if (auditData.logs) {
        setAuditLogs(auditData.logs);
      }
      if (statusData) {
        setDbStatus(statusData);
      }
    } catch (err) {
      console.error('Failed to fetch data from backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // Poll every 5 seconds so multi-device updates remain synchronized
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update single lead in state and re-sync audit logs
  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
    // Refresh audit trail
    fetch('/api/audit-trail')
      .then((r) => r.json())
      .then((d) => {
        if (d.logs) setAuditLogs(d.logs);
      })
      .catch(console.error);
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await fetch('/api/reset-demo', { method: 'POST' });
      await fetchAllData();
    } catch (err) {
      console.error('Failed to reset demo:', err);
    } finally {
      setIsResetting(false);
    }
  };

  // Interactive Walkthrough Jump handler
  const handleStartWalkthrough = (leadId: string, modulePath: string) => {
    setSelectedLeadIdForSplit(leadId);
    navigateTo(modulePath);
    if (modulePath === '/leads') {
      const target = leads.find((l) => l.id === leadId);
      if (target) {
        setSelectedLeadForCall(target);
      }
    }
  };

  const overdueCount = leads.filter((l) => l.isOverdue).length;
  const toursCount = leads.filter((l) => l.stage === 'tour_scheduled' || l.stage === 'tour_completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-50 to-indigo-50/30 text-zinc-900 font-sans antialiased flex flex-col">
      {/* Persistent Navigation Header */}
      <NavigationHeader
        currentPath={currentPath}
        onNavigate={navigateTo}
        activeOperator={activeOperator}
        onOperatorChange={setActiveOperator}
        onOpenAudit={() => setIsAuditDrawerOpen(true)}
      />

      {/* Main Content Area based on current route */}
      <main className="flex-1 pb-12">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-zinc-500 font-medium">Connecting to LeadZen Backend Store...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Route 1: /leads (M-POWER CALL Launcher) */}
            {currentPath === '/leads' && (
              <LeadsView
                leads={leads}
                onOpenMPowerCall={(lead) => setSelectedLeadForCall(lead)}
                onOpenBookingSplit={(lead) => {
                  setSelectedLeadIdForSplit(lead.id);
                  navigateTo('/booking-flow-split');
                }}
                activeOperator={activeOperator}
              />
            )}

            {/* Route 2: /movement-care (Movement CARE Daily 30 Draft) */}
            {currentPath === '/movement-care' && (
              <MovementCareView
                leads={leads}
                onUpdateLead={handleUpdateLead}
                activeOperator={activeOperator}
                onOpenMPowerCall={(lead) => setSelectedLeadForCall(lead)}
              />
            )}

            {/* Route 3: /booking-flow-split (Booking Flow Split Operator Workspace) */}
            {currentPath === '/booking-flow-split' && (
              <BookingFlowSplitView
                leads={leads}
                onUpdateLead={handleUpdateLead}
                activeOperator={activeOperator}
                selectedLeadId={selectedLeadIdForSplit}
                onOpenMPowerCall={(lead) => setSelectedLeadForCall(lead)}
              />
            )}

            {/* Route 4: /movement-os (Movement OS Pipeline & Side Work Panel) */}
            {currentPath === '/movement-os' && (
              <MovementOsView
                leads={leads}
                onSelectLead={(lead) => {}}
                onOpenMPowerCall={(lead) => setSelectedLeadForCall(lead)}
                onOpenBookingSplit={(lead) => {
                  setSelectedLeadIdForSplit(lead.id);
                  navigateTo('/booking-flow-split');
                }}
                activeOperator={activeOperator}
              />
            )}

            {/* Route 5: /closing (Closing Desk) */}
            {currentPath === '/closing' && (
              <ClosingDeskView
                leads={leads}
                onUpdateLead={handleUpdateLead}
                activeOperator={activeOperator}
                onOpenMPowerCall={(lead) => setSelectedLeadForCall(lead)}
              />
            )}

            {/* Route 6: /admin (Admin Movement Control Founder View) */}
            {currentPath === '/admin' && (
              <AdminMovementView
                leads={leads}
                auditLogs={auditLogs}
                onResetDemo={handleResetDemo}
                isResetting={isResetting}
                dbStatus={dbStatus}
                onOpenLead={(lead) => {
                  setSelectedLeadIdForSplit(lead.id);
                  navigateTo('/booking-flow-split');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* M-POWER CALL CONVERSATION ENGINE MODAL */}
      {selectedLeadForCall && (
        <MPowerCallModal
          lead={selectedLeadForCall}
          isOpen={!!selectedLeadForCall}
          onClose={() => setSelectedLeadForCall(null)}
          onCallCompleted={(updated) => {
            handleUpdateLead(updated);
            setSelectedLeadForCall(null);
          }}
          activeOperator={activeOperator}
        />
      )}

      {/* AUDIT TRAIL LEDGER DRAWER */}
      <AuditTrailDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
        logs={auditLogs}
        filterLeadId={auditFilterLeadId}
        onSelectLead={setAuditFilterLeadId}
      />

      {/* CANDIDATE SUBMISSION & INTERACTIVE WALKTHROUGH MODAL */}
      <WalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
        onStartCustomerWalkthrough={handleStartWalkthrough}
      />
    </div>
  );
}
