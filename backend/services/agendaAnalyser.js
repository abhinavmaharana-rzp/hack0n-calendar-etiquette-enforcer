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
}

module.exports = new AgendaAnalyzer();