import React, { useEffect, useRef } from 'react';
import SimplePeer from 'simple-peer';
import { useStore, socket } from '../store/useStore'; // Import socket

const Livestream = ({ room }) => {
  const videoRef = useRef();
  const { stream, setStream, joinStream, onSignal, onUserJoined, token } = useStore();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        videoRef.current.srcObject = stream;
        joinStream(room, token);

        const peer = new SimplePeer({ initiator: true, stream });
        peer.on('signal', (data) => {
          useStore.getState().handleSignal({ to: 'all', signal: data });
        });

        onSignal(({ from, signal }) => {
          peer.signal(signal);
        });

        peer.on('stream', (remoteStream) => {
          videoRef.current.srcObject = remoteStream;
        });
      })
      .catch(err => console.error('Error accessing media devices:', err));

    onUserJoined((id) => {
      const peer = new SimplePeer({ stream: useStore.getState().stream });
      peer.on('signal', (data) => {
        useStore.getState().handleSignal({ to: id, signal: data });
      });
      peer.on('stream', (remoteStream) => {
        videoRef.current.srcObject = remoteStream;
      });
    });

    return () => {
      socket.off('signal'); // Sử dụng socket từ useStore
      socket.off('user-joined');
    };
  }, [room, token]); // Thêm dependencies để tránh warning

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Livestream Nấu Ăn</h2>
      <video ref={videoRef} autoPlay className="w-full h-64" />
    </div>
  );
};

export default Livestream;