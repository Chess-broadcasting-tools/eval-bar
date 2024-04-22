import React, { useState, useEffect } from "react";
import styled from "styled-components";

const TournamentsWrapper = styled.div`
  margin-top: 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: ${(props) =>
    props.selected ? "10px solid #4CAF50" : "1px solid #ccc"};
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 1rem;
  cursor: pointer;
  background-color: ${(props) =>
    props.selected ? "rgba(76, 175, 80, 0.3)" : "rgba(1, 1, 4, 0.6)"};
  transition: all 0.3s ease-in-out;
  transform: perspective(1px) translateZ(0);
  width: 80%;
  max-width: 600px;

  &:hover {
    box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);
    border-color: #4caf50;
    transform: scale(1.05);
  }

  .card-image {
    width: 100%; // Adjust the width of the image
    height: auto; // Maintain aspect ratio
    margin-bottom: 1rem; // Add some space below the image
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const CardTitle = styled.h2`
  font-size: 1.8em;
  color: #faf9f6;
  margin-bottom: 1rem;
`;

const CardDate = styled.p`
  font-size: 1em;
  color: #faf9f6;
  margin-bottom: 1rem;
`;

const CardDescription = styled.p`
  font-size: 1em;
  color: #faf9f6;
  margin-bottom: 1rem;
  height: 4em;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Button = styled.a`
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #4caf50;
  color: white;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.3s;

  &:hover {
    background-color: #36a420;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  }
`;

const Title = styled.h1`
  borderbottom: 5px solid #4caf50;
  paddingbottom: 1rem;
  fontsize: 2em;
  fontweight: bold;
  color: #4caf50;
  textalign: center;
  marginbottom: 3rem;
  margin: 0 auto;
`;

const SearchWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;

const SearchInput = styled.input`
  margin-right: 1rem;
  padding: 0.5rem;
  font-size: 1em;
`;

const SearchButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #36a420;
  }
`;
function TournamentsList({ onSelect }) {
  const [tournaments, setTournaments] = useState([]);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTournaments, setSelectedTournaments] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [customUrl, setCustomUrl] = useState("");
  const [tournamentId, setTournamentId] = useState("");

  useEffect(() => {
    fetch("https://lichess.org/api/broadcast?nb=50")
      .then((response) => response.text())
      .then((data) => {
        const jsonData = data
          .trim()
          .split("\n")
          .map((line) => JSON.parse(line));
        const ongoingTournaments = jsonData.filter(
          (tournament) =>
            tournament.rounds &&
            tournament.rounds.some((round) => round.ongoing === true)
        );
        setTournaments(ongoingTournaments);
        setFilteredTournaments(ongoingTournaments);
      })
      .catch((error) => console.error("Error fetching tournaments:", error));
  }, []);

  const handleSearch = () => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = tournaments.filter((tournament) =>
      tournament.tour.name.toLowerCase().includes(lowerCaseSearchTerm)
    );
    setFilteredTournaments(filtered);
  };

  const handleCustomUrlChange = (e) => {
    setCustomUrl(e.target.value);
    const urlParts = e.target.value.split("/");
    const id = urlParts[urlParts.length - 1];
    setTournamentId(id);
  };

  const onSelectTournament = () => {
    if (tournamentId) {
      setSelectedTournaments([tournamentId]);
      onSelect([tournamentId]); // This line is added to simulate the selection
    }
  };

  return (
  <TournamentsWrapper>
    <Title>LIVE BROADCASTS</Title>
    <SearchWrapper>
      <SearchInput
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search tournaments..."
      />
      <SearchButton onClick={handleSearch}>Search</SearchButton>

      <SearchInput
        value={customUrl}
        onChange={handleCustomUrlChange}
        placeholder="Enter custom Lichess URL..."
      />
      <SearchButton onClick={onSelectTournament}>Go</SearchButton>
    </SearchWrapper>
    <Button
      onClick={() => {
        onSelect(selectedTournaments);
        setSelectedTournaments([]);
      }}
    >
      Confirm
    </Button>

    {filteredTournaments.length === 0 ? (
      <p>No ongoing broadcasts</p>
    ) : (
      filteredTournaments.map((tournament, index) =>
        tournament.tour && tournament.rounds && tournament.rounds.length > 0 ? (
          <Card
            key={tournament.tour.id}
            selected={selectedTournaments.includes(tournament.tour.id)}
          >
            {tournament.image && (
              <img
                className="card-image"
                src={tournament.image}
                alt="Tournament Image"
              />
            )}
            <input
              type="checkbox"
              checked={checkedItems[tournament.tour.id]}
              onChange={() => {
                setCheckedItems((prevState) => ({
                  ...prevState,
                  [tournament.tour.id]: !prevState[tournament.tour.id],
                }));
                const ongoingRound = tournament.rounds.find(
                  (round) => round.ongoing === true
                );
                if (ongoingRound) {
                  setSelectedTournaments((prevTournaments) =>
                    prevTournaments.includes(ongoingRound.id)
                      ? prevTournaments.filter((id) => id !== ongoingRound.id)
                      : [...prevTournaments, ongoingRound.id]
                  );
                }
              }}
            />
            <CardHeader>
              <CardTitle>{tournament.tour.name}</CardTitle>
              <CardDate>{tournament.tour.date}</CardDate>
            </CardHeader>
            <CardDescription>{tournament.tour.description}</CardDescription>
            <Button href={tournament.tour.url} target="_blank" rel="noreferrer">
              Official Website
            </Button>
          </Card>
        ) : null
      )
    )}
  </TournamentsWrapper>
);


export default TournamentsList;
