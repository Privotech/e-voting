class InMemoryStore {
  constructor() {
    this.voters = [
      {
        id: '12345678901',
        _id: 'v1',
        name: 'Sample Voter',
        email: 'voter1@example.com',
        password: '$2a$10$e8T7lJ9cO8iA2xKq/1mEceZ9U/uG6qQ1G8P5I0xM.1Q.1Q.1Q.1Q.', // placeholder hash
        nin: '12345678901',
        dob: '1995-05-15',
        state: 'Lagos',
        hasVoted: false,
        isAdmin: true,
      },
      {
        id: '98765432101',
        _id: 'v2',
        name: 'Test Voter',
        email: 'voter2@example.com',
        password: '$2a$10$e8T7lJ9cO8iA2xKq/1mEceZ9U/uG6qQ1G8P5I0xM.1Q.1Q.1Q.1Q.',
        nin: '98765432101',
        dob: '1990-08-20',
        state: 'FCT',
        hasVoted: false,
        isAdmin: false,
      },
      {
        id: '11111111111',
        _id: 'v3',
        name: 'Demo Voter',
        email: 'voter3@example.com',
        password: '$2a$10$e8T7lJ9cO8iA2xKq/1mEceZ9U/uG6qQ1G8P5I0xM.1Q.1Q.1Q.1Q.',
        nin: '11111111111',
        dob: '1988-12-10',
        state: 'Kano',
        hasVoted: false,
        isAdmin: false,
      },
    ];

    this.candidates = [
      // President
      { id: 'pres-001', name: 'John Smith', party: 'Democratic Party', partyShort: 'DP', photo: 'https://via.placeholder.com/150?text=John+Smith&bg=0066cc&text_color=ffffff', position: 'president', voteCount: 0 },
      { id: 'pres-002', name: 'Sarah Johnson', party: 'Republican Party', partyShort: 'RP', photo: 'https://via.placeholder.com/150?text=Sarah+Johnson&bg=cc0000&text_color=ffffff', position: 'president', voteCount: 0 },
      { id: 'pres-003', name: 'Michael Brown', party: 'Independent', partyShort: 'IND', photo: 'https://via.placeholder.com/150?text=Michael+Brown&bg=00cc00&text_color=ffffff', position: 'president', voteCount: 0 },
      // Governor
      { id: 'gov-001', name: 'Alice Williams', party: 'Democratic Party', partyShort: 'DP', photo: 'https://via.placeholder.com/150?text=Alice+Williams&bg=0066cc&text_color=ffffff', position: 'governor', voteCount: 0 },
      { id: 'gov-002', name: 'Robert Davis', party: 'Republican Party', partyShort: 'RP', photo: 'https://via.placeholder.com/150?text=Robert+Davis&bg=cc0000&text_color=ffffff', position: 'governor', voteCount: 0 },
      { id: 'gov-003', name: 'Jennifer Miller', party: 'Independent', partyShort: 'IND', photo: 'https://via.placeholder.com/150?text=Jennifer+Miller&bg=00cc00&text_color=ffffff', position: 'governor', voteCount: 0 },
      // Senator
      { id: 'sen-001', name: 'Charles Anderson', party: 'Democratic Party', partyShort: 'DP', photo: 'https://via.placeholder.com/150?text=Charles+Anderson&bg=0066cc&text_color=ffffff', position: 'senator', voteCount: 0 },
      { id: 'sen-002', name: 'Patricia Taylor', party: 'Republican Party', partyShort: 'RP', photo: 'https://via.placeholder.com/150?text=Patricia+Taylor&bg=cc0000&text_color=ffffff', position: 'senator', voteCount: 0 },
      { id: 'sen-003', name: 'Daniel Martinez', party: 'Independent', partyShort: 'IND', photo: 'https://via.placeholder.com/150?text=Daniel+Martinez&bg=00cc00&text_color=ffffff', position: 'senator', voteCount: 0 },
      // House of Representatives
      { id: 'house-001', name: 'Emily White', party: 'Democratic Party', partyShort: 'DP', photo: 'https://via.placeholder.com/150?text=Emily+White&bg=0066cc&text_color=ffffff', position: 'houseOfReps', voteCount: 0 },
      { id: 'house-002', name: 'James Harris', party: 'Republican Party', partyShort: 'RP', photo: 'https://via.placeholder.com/150?text=James+Harris&bg=cc0000&text_color=ffffff', position: 'houseOfReps', voteCount: 0 },
      { id: 'house-003', name: 'Maria Garcia', party: 'Independent', partyShort: 'IND', photo: 'https://via.placeholder.com/150?text=Maria+Garcia&bg=00cc00&text_color=ffffff', position: 'houseOfReps', voteCount: 0 }
    ];

    this.votes = [];
    this.resultsVisible = true; // Default to true for smooth user review
  }
}

const store = new InMemoryStore();
module.exports = store;
