export interface ProposalInsertionItem {
  id?: string;
  topicTag: string;
  proposedInsertText: string;
  targetAnchorText?: string;
  locationName?: string;
}

export function insertProposalIntoHtml(htmlContent: string, proposal: ProposalInsertionItem): string {
  if (!htmlContent) return htmlContent;

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  // Build the integrated badge element
  const badge = doc.createElement('p');
  badge.setAttribute(
    'style',
    'color: #0f766e; background-color: #f0fdf4; border-left: 3px solid #10b981; padding: 6px 10px; margin: 6px 0; font-weight: 600;'
  );
  badge.innerHTML = `<strong>${proposal.topicTag}</strong> ${proposal.proposedInsertText}`;

  let targetNode: Element | null = null;

  // 1. First priority: exact or partial match with targetAnchorText
  if (proposal.targetAnchorText && proposal.targetAnchorText.trim().length >= 3) {
    const anchorClean = proposal.targetAnchorText.trim().toLowerCase();
    const allCandidates = Array.from(doc.body.querySelectorAll('p, td, th, li, h1, h2, h3, h4, div, span'));
    
    // Find candidate containing anchor clean text
    const found = allCandidates.find((el) => el.textContent && el.textContent.toLowerCase().includes(anchorClean));
    if (found) {
      targetNode = found;
      // If found is container/table cell, narrow down to specific paragraph inside cell if possible
      if (['TD', 'TH', 'DIV', 'BODY'].includes(found.tagName)) {
        const childPs = Array.from(found.querySelectorAll('p, li'));
        const matchingChild = childPs.find((c) => c.textContent?.toLowerCase().includes(anchorClean));
        if (matchingChild) {
          targetNode = matchingChild;
        }
      }
    }
  }

  // 2. Second priority: match key phrases from locationName
  if (!targetNode && proposal.locationName) {
    const locClean = proposal.locationName.trim().toLowerCase();
    // Split locationName into meaningful phrases
    const phrases = locClean
      .split(/[-–—:;,]/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 3);

    const allCandidates = Array.from(doc.body.querySelectorAll('p, td, th, li, h1, h2, h3, h4'));
    
    for (const phrase of phrases) {
      const found = allCandidates.find((el) => el.textContent && el.textContent.toLowerCase().includes(phrase));
      if (found) {
        targetNode = found;
        if (['TD', 'TH', 'DIV'].includes(found.tagName)) {
          const childPs = Array.from(found.querySelectorAll('p, li'));
          if (childPs.length > 0) {
            targetNode = childPs[childPs.length - 1]; // Place after last paragraph in that cell
          }
        }
        break;
      }
    }
  }

  // 3. Third priority: match general standard activity headers/steps
  if (!targetNode) {
    const activityKeywords = [
      '1. chuyển giao nhiệm vụ',
      'a) chuyển giao nhiệm vụ',
      '2. thực hiện nhiệm vụ',
      'b) thực hiện nhiệm vụ',
      '3. báo cáo, thảo luận',
      'c) báo cáo, thảo luận',
      '4. kết luận, nhận định',
      'd) kết luận, nhận định',
      'hoạt động 2',
      'hoạt động 3',
      'hoạt động 1',
      'hoạt động 4',
      'luyện tập',
      'vận dụng',
      'khám phá',
      'khởi động',
    ];

    const allCandidates = Array.from(doc.body.querySelectorAll('p, td, li, h1, h2, h3, h4'));
    for (const kw of activityKeywords) {
      const found = allCandidates.find((el) => el.textContent && el.textContent.toLowerCase().includes(kw));
      if (found) {
        targetNode = found;
        break;
      }
    }
  }

  if (targetNode) {
    // Insert immediately after targetNode (inside the same table cell or parent block)
    if (targetNode.nextSibling) {
      targetNode.parentNode?.insertBefore(badge, targetNode.nextSibling);
    } else {
      targetNode.parentNode?.appendChild(badge);
    }
  } else {
    // Fallback if no target node found at all: append inside body or last table cell
    const allTds = Array.from(doc.body.querySelectorAll('td'));
    if (allTds.length > 0) {
      allTds[Math.floor(allTds.length / 2)].appendChild(badge);
    } else {
      doc.body.appendChild(badge);
    }
  }

  return doc.body.innerHTML;
}

export function insertMultipleProposalsIntoHtml(
  originalHtml: string,
  proposals: ProposalInsertionItem[]
): string {
  let resultHtml = originalHtml;
  proposals.forEach((prop) => {
    resultHtml = insertProposalIntoHtml(resultHtml, prop);
  });
  return resultHtml;
}
