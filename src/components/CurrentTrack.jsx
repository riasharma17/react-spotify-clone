import React, { useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { useStateProvider } from "../utils/StateProvider";
import { reducerCases } from "../utils/Constants";
export default function CurrentTrack() {
  const [{ token, currentPlaying }, dispatch] = useStateProvider();
  useEffect(() => {
    const getCurrentTrack = async () => {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        }
      );
      if (response.data !== "") {
        const currentPlaying = {
          id: response.data.item.id,
          name: response.data.item.name,
          artists: response.data.item.artists.map((artist) => artist.name),
          image: response.data.item.album.images[2].url,
        };
        dispatch({ type: reducerCases.SET_PLAYING, currentPlaying });
      } else {
        dispatch({ type: reducerCases.SET_PLAYING, currentPlaying: null });
      }
    };
    getCurrentTrack();
  }, [token, dispatch]);
  return (
    <Container>
      {currentPlaying && (
        <div className="track">
          <div className="track__image">
            <img src={currentPlaying.image} alt="currentPlaying" />
          </div>
          <div className="track__info">
            <h4 className="track__info__track__name">{currentPlaying.name}</h4>
            <h6 className="track__info__track__artists">
              {currentPlaying.artists.join(", ")}
            </h6>
          </div>
        </div>
      )}
    </Container>
  );
}

const Container = styled.div`
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  max-width: 360px;

  .track {
    display: flex;
    align-items: center;
    gap: 1rem;

    &__image {
      img {
        height: 64px;
        width: 64px;
        border-radius: 8px;
        object-fit: cover;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.6);
      }
    }

    &__info {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      font-family: "Poppins", sans-serif;

      &__track__name {
        font-size: 1rem;
        font-weight: 600;
        color: #ffffff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px;
      }

      &__track__artists {
        font-size: 0.85rem;
        color: #b3b3b3;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    max-width: 100%;

    .track__image img {
      height: 48px;
      width: 48px;
    }

    .track__info__track__name {
      font-size: 0.9rem;
    }

    .track__info__track__artists {
      font-size: 0.75rem;
    }
  }
`;
