// Swimlane specs rendered by <Swimlane />. col = column index, lane = lane id.
export const E2E = {
  lanes: [
    { id: 'source', label: 'Source System Team (HRIS)' },
    { id: 'custodian', label: 'Tech & Digital (Custodian)' },
    { id: 'champion', label: 'HR Data Champion' },
    { id: 'steward', label: 'HR Data Steward' },
  ],
  nodes: [
    { id: 's', lane: 'steward', col: 0, type: 'start', label: 'Start' },
    { id: 'n1', lane: 'steward', col: 1, label: '1. Define logical DQ rules for the data asset', tpl: true },
    { id: 'd1', lane: 'custodian', col: 1, type: 'decision', label: 'Asset in Informatica catalog?' },
    { id: 'n2', lane: 'custodian', col: 2, label: '2. Ask source team to load the asset' },
    { id: 'n3', lane: 'source', col: 2, label: '3. Load new / modified asset into the extract' },
    { id: 'n4', lane: 'custodian', col: 3, label: '4. Build pipeline, register metadata in CDGC' },
    { id: 'n5', lane: 'custodian', col: 4, label: '5. Implement DQ rules in Informatica CDQ' },
    { id: 'n6', lane: 'custodian', col: 5, label: '6. Run DQ scan, send report to Steward' },
    { id: 'n7', lane: 'steward', col: 6, label: '7. Review report, list high-priority issues' },
    { id: 'n8', lane: 'champion', col: 7, label: '8. Review & confirm high-priority list' },
    { id: 'n9', lane: 'custodian', col: 8, label: '9. Log issues in the Issue Registry', tpl: true },
    { id: 'n10', lane: 'source', col: 9, label: '10. RCA & remediation of high-priority issues', tpl: true },
    { id: 'n11', lane: 'steward', col: 10, label: '11. Monitor DQ scores & remediation status' },
    { id: 'e', lane: 'steward', col: 11, type: 'end', label: 'End' },
  ],
  edges: [
    { from: 's', to: 'n1' }, { from: 'n1', to: 'd1' }, { from: 'd1', to: 'n2', label: 'No' }, { from: 'n2', to: 'n3' },
    { from: 'n3', to: 'n4' }, { from: 'n4', to: 'n5' }, { from: 'd1', to: 'n5', label: 'Yes', route: 'above' },
    { from: 'n5', to: 'n6' }, { from: 'n6', to: 'n7' }, { from: 'n7', to: 'n8' }, { from: 'n8', to: 'n9' },
    { from: 'n9', to: 'n10' }, { from: 'n10', to: 'n11' }, { from: 'n11', to: 'e' },
  ],
}

export const RULES_WF = {
  lanes: [
    { id: 'council', label: 'DG Working Group' },
    { id: 'steward', label: 'Data Steward & Business' },
    { id: 'custodian', label: 'Data Custodian' },
  ],
  nodes: [
    { id: 's', lane: 'council', col: 0, type: 'start', label: 'Start' },
    { id: 'n1', lane: 'council', col: 1, label: 'Initiate profiling for selected elements' },
    { id: 'n2', lane: 'custodian', col: 1, label: 'Profile the relevant data sets', tpl: true },
    { id: 'n3', lane: 'custodian', col: 2, label: 'Formulate DQ rules', tpl: true },
    { id: 'n4', lane: 'steward', col: 2, label: 'Confirm rules cover business needs' },
    { id: 'n5', lane: 'council', col: 2, label: 'Approve DQ rules (Data Owner)' },
    { id: 'n6', lane: 'council', col: 3, label: 'Decide threshold for each rule', tpl: true },
    { id: 'n7', lane: 'custodian', col: 3, label: 'Build rule logic in Informatica CDQ' },
    { id: 'n8', lane: 'custodian', col: 4, label: 'Schedule scans to collect measurements' },
    { id: 'n9', lane: 'custodian', col: 5, label: 'Start DQ reporting & measurement' },
    { id: 'n10', lane: 'council', col: 5, label: 'Analyze DQ measurements' },
    { id: 'n11', lane: 'council', col: 6, label: 'Update thresholds if needed' },
    { id: 'e', lane: 'custodian', col: 7, type: 'end', label: 'End' },
  ],
  edges: [
    { from: 's', to: 'n1' }, { from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }, { from: 'n3', to: 'n4' }, { from: 'n4', to: 'n5' },
    { from: 'n5', to: 'n6' }, { from: 'n6', to: 'n7' }, { from: 'n7', to: 'n8' }, { from: 'n8', to: 'n9' },
    { from: 'n9', to: 'n10' }, { from: 'n10', to: 'n11' }, { from: 'n11', to: 'n9', route: 'v' }, { from: 'n9', to: 'e', route: 'below' },
  ],
}

export const ISSUE_WF = {
  lanes: [
    { id: 'council', label: 'DG Working Group' },
    { id: 'steward', label: 'Data Steward & Business' },
    { id: 'custodian', label: 'Data Custodian' },
  ],
  nodes: [
    { id: 's', lane: 'steward', col: 0, type: 'start', label: 'Start' },
    { id: 'n1', lane: 'steward', col: 1, label: 'Raise data issue' },
    { id: 'd1', lane: 'council', col: 1, type: 'decision', label: 'Valid issue?' },
    { id: 'n2', lane: 'council', col: 2, label: 'Log issue in the Issue Registry', tpl: true },
    { id: 'n3', lane: 'council', col: 3, label: 'Prioritize issue', tpl: true },
    { id: 'n4', lane: 'custodian', col: 3, label: 'Investigate root cause', tpl: true },
    { id: 'n5', lane: 'custodian', col: 4, label: 'Identify solution options' },
    { id: 'n6', lane: 'steward', col: 4, label: 'Select & approve solution' },
    { id: 'd2', lane: 'council', col: 5, type: 'decision', label: 'Proceed?' },
    { id: 'n7', lane: 'custodian', col: 6, label: 'Execute solution', tpl: true },
    { id: 'n8', lane: 'steward', col: 7, label: 'Confirm resolution (business test)' },
    { id: 'd3', lane: 'steward', col: 8, type: 'decision', label: 'Resolved?' },
    { id: 'n9', lane: 'custodian', col: 8, label: 'Start / update DQ rule & threshold' },
    { id: 'n10', lane: 'steward', col: 9, label: 'Escalate issue' },
    { id: 'n11', lane: 'custodian', col: 9, label: 'Resume DQ reporting & measurement' },
    { id: 'n12', lane: 'council', col: 10, label: 'Close issue & inform user' },
    { id: 'e', lane: 'council', col: 11, type: 'end', label: 'End' },
  ],
  edges: [
    { from: 's', to: 'n1' }, { from: 'n1', to: 'd1' }, { from: 'd1', to: 'n2', label: 'Yes' }, { from: 'd1', to: 'n12', label: 'No', route: 'top' },
    { from: 'n2', to: 'n3' }, { from: 'n3', to: 'n4' }, { from: 'n4', to: 'n5' }, { from: 'n5', to: 'n6' }, { from: 'n6', to: 'd2' },
    { from: 'd2', to: 'n7', label: 'Yes' }, { from: 'd2', to: 'n12', label: 'No', route: 'top' },
    { from: 'n7', to: 'n8' }, { from: 'n8', to: 'd3' }, { from: 'd3', to: 'n9', label: 'Yes' }, { from: 'd3', to: 'n10', label: 'No' },
    { from: 'n9', to: 'n11' }, { from: 'n10', to: 'n12' }, { from: 'n11', to: 'n12' }, { from: 'n12', to: 'e' },
  ],
}

export const REPORT_WF = {
  lanes: [
    { id: 'council', label: 'DG Working Group' },
    { id: 'steward', label: 'Data Steward & Business' },
    { id: 'custodian', label: 'Data Custodian' },
  ],
  nodes: [
    { id: 's', lane: 'council', col: 0, type: 'start', label: 'Start' },
    { id: 'n1', lane: 'council', col: 1, label: 'Define DQ rules to report on the dashboard' },
    { id: 'n2', lane: 'steward', col: 1, label: 'Confirm priorities on dashboard' },
    { id: 'n3', lane: 'custodian', col: 2, label: 'Expose DQ rules & scores to dashboard' },
    { id: 'n4', lane: 'steward', col: 3, label: 'Analyze DQ dashboard trends' },
    { id: 'd1', lane: 'council', col: 4, type: 'decision', label: 'Looking good?' },
    { id: 'n5', lane: 'steward', col: 4, label: 'Start issue management & resolution' },
    { id: 'd2', lane: 'council', col: 5, type: 'decision', label: 'Adjust DQ rules?' },
    { id: 'n6', lane: 'steward', col: 5, label: 'Start rule & threshold definition' },
    { id: 'd3', lane: 'council', col: 6, type: 'decision', label: 'Adjust dashboard?' },
    { id: 'n7', lane: 'council', col: 7, label: 'Report status to DG forums' },
    { id: 'e', lane: 'council', col: 8, type: 'end', label: 'End' },
  ],
  edges: [
    { from: 's', to: 'n1' }, { from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }, { from: 'n3', to: 'n4' },
    { from: 'n4', to: 'd1', route: 'v' }, { from: 'd1', to: 'n5', label: 'No' }, { from: 'd1', to: 'd2', label: 'Yes' },
    { from: 'n5', to: 'n4' }, { from: 'd2', to: 'n6', label: 'Yes' }, { from: 'n6', to: 'n4', route: 'below' },
    { from: 'd2', to: 'd3', label: 'No' }, { from: 'd3', to: 'n1', label: 'Yes', route: 'top' }, { from: 'd3', to: 'n7', label: 'No' }, { from: 'n7', to: 'e' },
  ],
}
