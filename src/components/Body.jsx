import axios from "axios";
import React, { useEffect } from "react";
import styled from "styled-components";
import { useStateProvider } from "../utils/StateProvider";
import { AiFillClockCircle } from "react-icons/ai";
import { reducerCases } from "../utils/Constants";
export default function Body({ headerBackground }) {
  const [{ token, selectedPlaylist, selectedPlaylistId }, dispatch] =
    useStateProvider();

  useEffect(() => {
    const getInitialPlaylist = async () => {
      const response = await axios.get(
        `https://api.spotify.com/v1/playlists/${selectedPlaylistId}`,
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      );
      const selectedPlaylist = {
        id: response.data.id,
        name: response.data.name,
        description: response.data.description.startsWith("<a")
          ? ""
          : response.data.description,
        image: response.data.images[0].url,
        tracks: response.data.tracks.items.map(({ track }) => ({
          id: track.id,
          name: track.name,
          artists: track.artists.map((artist) => artist.name),
          image: track.album.images[2].url,
          duration: track.duration_ms,
          album: track.album.name,
          context_uri: track.album.uri,
          track_number: track.track_number,
        })),
      };
      dispatch({ type: reducerCases.SET_PLAYLIST, selectedPlaylist });
    };
    getInitialPlaylist();
  }, [token, dispatch, selectedPlaylistId]);
  const playTrack = async (
    id,
    name,
    artists,
    image,
    context_uri,
    track_number
  ) => {
    const response = await axios.put(
      `https://api.spotify.com/v1/me/player/play`,
      {
        context_uri,
        offset: {
          position: track_number - 1,
        },
        position_ms: 0,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );
    if (response.status === 204) {
      const currentPlaying = {
        id,
        name,
        artists,
        image,
      };
      dispatch({ type: reducerCases.SET_PLAYING, currentPlaying });
      dispatch({ type: reducerCases.SET_PLAYER_STATE, playerState: true });
    } else {
      dispatch({ type: reducerCases.SET_PLAYER_STATE, playerState: true });
    }
  };
  const msToMinutesAndSeconds = (ms) => {
    var minutes = Math.floor(ms / 60000);
    var seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  };
  return (
    <Container headerBackground={headerBackground}>
      {selectedPlaylist && (
        <>
          <div className="playlist">
            <div className="image">
              <img src={selectedPlaylist.image} alt="selected playlist" />
            </div>
            <div className="details">
              <span className="type">PLAYLIST</span>
              <h1 className="title">{selectedPlaylist.name}</h1>
              <p className="description">{selectedPlaylist.description}</p>
            </div>
          </div>
          <div className="list">
            <div className="header-row">
              <div className="col">
                <span>#</span>
              </div>
              <div className="col">
                <span>TITLE</span>
              </div>
              <div className="col">
                <span>ALBUM</span>
              </div>
              <div className="col">
                <span>
                  <AiFillClockCircle />
                </span>
              </div>
            </div>
            <div className="tracks">
              {selectedPlaylist.tracks.map(
                (
                  {
                    id,
                    name,
                    artists,
                    image,
                    duration,
                    album,
                    context_uri,
                    track_number,
                  },
                  index
                ) => {
                  return (
                    <div
                      className="row"
                      key={id}
                      onClick={() =>
                        playTrack(
                          id,
                          name,
                          artists,
                          image,
                          context_uri,
                          track_number
                        )
                      }
                    >
                      <div className="col">
                        <span>{index + 1}</span>
                      </div>
                      <div className="col detail">
                        <div className="image">
                          <img src={image} alt="track" />
                        </div>
                        <div className="info">
                          <span className="name">{name}</span>
                          <span>{artists}</span>
                        </div>
                      </div>
                      <div className="col">
                        <span>{album}</span>
                      </div>
                      <div className="col">
                        <span>{msToMinutesAndSeconds(duration)}</span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </>
      )}
    </Container>
  );
}

const Container = styled.div`
  padding: 2rem;
  font-family: "Poppins", sans-serif;

  .playlist {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-bottom: 3rem;

    .image {
      img {
        height: 220px;
        width: 220px;
        object-fit: cover;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      }
    }

    .details {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      color: #ffffff;

      .type {
        font-size: 0.75rem;
        letter-spacing: 2px;
        color: #b3b3b3;
      }

      .title {
        font-size: 3rem;
        font-weight: 700;
        color: #fff;
      }

      .description {
        color: #c7c7c7;
        font-size: 0.9rem;
        line-height: 1.4;
      }
    }
  }

  .list {
    .header-row {
      display: grid;
      grid-template-columns: 0.5fr 3fr 2fr 0.5fr;
      align-items: center;
      background-color: ${({ headerBackground }) =>
        headerBackground ? "rgba(0, 0, 0, 0.8)" : "transparent"};
      padding: 1rem 2rem;
      border-bottom: 1px solid #333;
      color: #b3b3b3;
      font-weight: 600;
      font-size: 0.85rem;
      position: sticky;
      top: 12vh;
      z-index: 10;
      backdrop-filter: blur(6px);
    }

    .tracks {
      display: flex;
      flex-direction: column;
      margin-top: 1rem;

      .row {
        display: grid;
        grid-template-columns: 0.5fr 3fr 2fr 0.5fr;
        align-items: center;
        padding: 0.75rem 2rem;
        cursor: pointer;
        transition: background 0.2s ease-in-out;
        border-radius: 8px;
        margin: 0.25rem 0;

        &:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .col {
          display: flex;
          align-items: center;
          color: #e6e6e6;
          font-size: 0.9rem;

          img {
            height: 45px;
            width: 45px;
            border-radius: 6px;
            object-fit: cover;
          }
        }

        .detail {
          display: flex;
          gap: 1rem;

          .info {
            display: flex;
            flex-direction: column;
            span {
              line-height: 1.2;
            }

            .name {
              font-weight: 600;
              color: #fff;
            }

            span:last-child {
              font-size: 0.75rem;
              color: #b3b3b3;
            }
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    .playlist {
      flex-direction: column;
      align-items: flex-start;

      .image img {
        height: 180px;
        width: 180px;
      }

      .details .title {
        font-size: 2rem;
      }
    }

    .list .header-row,
    .list .tracks .row {
      grid-template-columns: 0.5fr 3fr 1.5fr 0.5fr;
      padding: 0.5rem 1rem;
    }
  }
`;

