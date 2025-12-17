/**
 * Advanced Agenda Quality Analyzer
 */

class AgendaAnalyzer {
  
  /**
   * Analyze agenda comprehensively
   */
  analyzeAgenda(agendaText) {
    const scores = {
      clarity: this.checkClarity(agendaText),
      completeness: this.checkCompleteness(agendaText),
      actionability: this.checkActionability(agendaText),
      structure: this.checkStructure(agendaText)
    };
    
    const overallScore = this.calculateOverallScore(scores);
    const feedback = this.generateFeedback(scores, agendaText);
    
    return {
      score: overallScore,
      breakdown: scores,
      feedback,
      passed: overallScore >= 70
    };
  }
  
  /**
   * Check clarity (30 points)
   */
  checkClarity(text) {
    let score = 0;
    
    // Has clear purpose
    if (/purpose|objective|goal|why/i.test(text)) score += 10;
    
    // Not too short
    if (text.length > 100) score += 10;
    
    // Uses clear language (not too much jargon)
    const jargonWords = (text.match(/synergy|leverage|circle back|touch base|deep dive/gi) || []).length;
    if (jargonWords < 3) score += 10;
    
    return score;
  }
  
  /**
   * Check completeness (30 points)
   */
  checkCompleteness(text) {
    let score = 0;
    
    // Has outcomes section
    if (/outcome|result|deliverable|output/i.test(text)) score += 10;
    
    // Has decisions section
    if (/decision|decide|approve|choose/i.test(text)) score += 10;
    
    // Has attendee context
    if (/attendee|participant|who|team/i.test(text)) score += 5;
    
    // Has time context
    if (/time|duration|minute|hour/i.test(text)) score += 5;
    
    return score;
  }
  
  /**
   * Check actionability (25 points)
   */
  checkActionability(text) {
    let score = 0;
    
    // Has action verbs
    const actionVerbs = ['discuss', 'decide', 'review', 'approve', 'plan', 'align'];
    const foundVerbs = actionVerbs.filter(verb => 
      new RegExp(verb, 'i').test(text)
    ).length;
    
    score += Math.min(foundVerbs * 5, 15);
    
    // Has specific items (bullets/numbers)
    if (/[•\-\*]|\d+\./g.test(text)) score += 10;
    
    return score;
  }
  
  /**
   * Check structure (15 points)
   */
  checkStructure(text) {
    let score = 0;
    
    // Has sections/headers
    if (/purpose:|outcome:|decision:/i.test(text)) score += 10;
    
    // Has proper formatting
    if (/\n/.test(text)) score += 5; // Multiple lines
    
    return score;
  }
  
  /**
   * Calculate overall score
   */
  calculateOverallScore(scores) {
    return scores.clarity + scores.completeness + 
           scores.actionability + scores.structure;
  }
  
  /**
   * Generate actionable feedback
   */
  generateFeedback(scores, text) {
    const feedback = [];
    
    if (scores.clarity < 20) {
      feedback.push({
        type: 'warning',
        message: '💡 Make your purpose clearer. Add "Purpose: [why are we meeting?]"'
      });
    }
    
    if (scores.completeness < 20) {
      feedback.push({
        type: 'warning',
        message: '📋 Add expected outcomes. What should we accomplish?'
      });
    }
    
    if (scores.actionability < 15) {
      feedback.push({
        type: 'warning',
        message: '⚡ Be more specific. List concrete discussion points.'
      });
    }
    
    if (scores.structure < 10) {
      feedback.push({
        type: 'info',
        message: '📝 Use our template for better structure.'
      });
    }
    
    // Add positive feedback
    if (scores.clarity >= 25) {
      feedback.push({
        type: 'success',
        message: '✨ Great clarity! Purpose is well-defined.'
      });
    }
    
    return feedback;
  }
  
  /**
   * Suggest improvements
   */
  suggestImprovements(text) {
    const suggestions = [];
    
    // Missing purpose
    if (!/purpose|objective/i.test(text)) {
      suggestions.push('Add a clear purpose statement');
    }
    
    // Missing outcomes
    if (!/outcome|result|deliverable/i.test(text)) {
      suggestions.push('Define expected outcomes');
    }
    
    // Missing decisions
    if (!/decision|approve/i.test(text)) {
      suggestions.push('List decisions that need to be made');
    }
    
    // Too short
    if (text.length < 100) {
      suggestions.push('Provide more detail (current: ' + text.length + ' chars)');
    }
    
    // No structure
    if (!/:/.test(text)) {
      suggestions.push('Use sections: Purpose, Outcomes, Decisions');
    }
    
    return suggestions;
  }

  /**
   * Suggest agenda based on meeting context
   */
  suggestAgenda(meetingTitle, attendeeCount, duration, meetingType = null) {
    const suggestions = {
      purpose: this.suggestPurpose(meetingTitle, meetingType),
      outcomes: this.suggestOutcomes(meetingTitle, meetingType),
      discussionPoints: this.suggestDiscussionPoints(meetingTitle, meetingType, attendeeCount),
      prereads: this.suggestPrereads(meetingTitle, meetingType),
      template: this.generateTemplate(meetingTitle, attendeeCount, duration, meetingType)
    };

    return suggestions;
  }

  suggestPurpose(title, type) {
    const titleLower = title.toLowerCase();
    const purposes = [];

    // Pattern matching for common meeting types
    if (/standup|daily|sync/i.test(title)) {
      purposes.push('Daily team sync to align on priorities and blockers');
      purposes.push('Quick status update and coordination');
    } else if (/review|retro|retrospective/i.test(title)) {
      purposes.push('Review progress and identify improvements');
      purposes.push('Reflect on what worked and what didn\'t');
    } else if (/planning|plan/i.test(title)) {
      purposes.push('Plan upcoming work and set priorities');
      purposes.push('Align on goals and roadmap');
    } else if (/demo|showcase/i.test(title)) {
      purposes.push('Demonstrate completed work and gather feedback');
      purposes.push('Show progress and celebrate achievements');
    } else if (/1:1|one-on-one/i.test(title)) {
      purposes.push('One-on-one check-in and feedback session');
      purposes.push('Discuss progress, challenges, and career development');
    } else if (/all-hands|town hall/i.test(title)) {
      purposes.push('Company-wide update and Q&A');
      purposes.push('Share important announcements and gather feedback');
    } else {
      // Generic suggestions
      purposes.push(`Discuss ${title} and align on next steps`);
      purposes.push(`Review ${title} and make decisions`);
      purposes.push(`Plan and coordinate ${title}`);
    }

    return purposes;
  }

  suggestOutcomes(title, type) {
    const outcomes = [];

    if (/standup|daily/i.test(title)) {
      outcomes.push('Team aligned on daily priorities');
      outcomes.push('Blockers identified and assigned owners');
      outcomes.push('Action items for the day');
    } else if (/review|retro/i.test(title)) {
      outcomes.push('Action items for improvement');
      outcomes.push('Key learnings documented');
      outcomes.push('Next sprint goals defined');
    } else if (/planning|plan/i.test(title)) {
      outcomes.push('Prioritized backlog items');
      outcomes.push('Timeline and milestones agreed upon');
      outcomes.push('Resource allocation decided');
    } else if (/demo/i.test(title)) {
      outcomes.push('Feedback collected and documented');
      outcomes.push('Next steps for iteration');
    } else {
      outcomes.push('Clear action items assigned');
      outcomes.push('Decisions documented');
      outcomes.push('Next steps defined');
    }

    return outcomes;
  }

  suggestDiscussionPoints(title, type, attendeeCount) {
    const points = [];
    const titleLower = title.toLowerCase();

    if (/standup|daily/i.test(title)) {
      points.push('What did you complete yesterday?');
      points.push('What are you working on today?');
      points.push('Any blockers or dependencies?');
    } else if (/review|retro/i.test(title)) {
      points.push('What went well?');
      points.push('What could be improved?');
      points.push('Action items for next iteration');
    } else if (/planning/i.test(title)) {
      points.push('Priorities and goals');
      points.push('Timeline and milestones');
      points.push('Resource requirements');
      points.push('Risks and dependencies');
    } else if (/1:1/i.test(title)) {
      points.push('Progress on goals');
      points.push('Challenges and support needed');
      points.push('Career development');
      points.push('Feedback exchange');
    } else {
      points.push('Current status and context');
      points.push('Key decisions needed');
      points.push('Action items and owners');
      if (attendeeCount > 5) {
        points.push('Breakout discussions if needed');
      }
    }

    return points;
  }

  suggestPrereads(title, type) {
    const prereads = [];

    if (/review|demo/i.test(title)) {
      prereads.push('Review demo materials or documentation');
      prereads.push('Prepare questions and feedback');
    } else if (/planning/i.test(title)) {
      prereads.push('Review relevant documents and data');
      prereads.push('Come prepared with ideas and priorities');
    } else if (/all-hands/i.test(title)) {
      prereads.push('Review previous meeting notes');
      prereads.push('Prepare questions for Q&A');
    } else {
      prereads.push('Review meeting context and background');
      prereads.push('Come prepared with relevant information');
    }

    return prereads;
  }

  generateTemplate(title, attendeeCount, duration, type) {
    const purpose = this.suggestPurpose(title, type)[0];
    const outcomes = this.suggestOutcomes(title, type);
    const discussionPoints = this.suggestDiscussionPoints(title, type, attendeeCount);
    const prereads = this.suggestPrereads(title, type);

    return `📍 Purpose:
${purpose}

🎯 Expected Outcomes:
${outcomes.map(o => `• ${o}`).join('\n')}

⚡ Discussion Points:
${discussionPoints.map(p => `• ${p}`).join('\n')}

📌 Pre-reads:
${prereads.map(p => `• ${p}`).join('\n')}`;
  }
}

module.exports = new AgendaAnalyzer();