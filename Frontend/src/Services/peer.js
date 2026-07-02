class PeerService {
  constructor() {
    this.peer = null;
    this.createPeer();
  }

  createPeer() {
    this.peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    });

    return this.peer;
  }

  resetPeer() {
    if (this.peer) {
      this.peer.onicecandidate = null;
      this.peer.ontrack = null;
      this.peer.onnegotiationneeded = null;
      this.peer.close();
    }
    return this.createPeer();
  }

  addStream(stream) {
    if (!this.peer || !stream) return;

    const existingTrackIds = new Set(
      this.peer.getSenders().map((sender) => sender.track?.id).filter(Boolean)
    );

    stream.getTracks().forEach((track) => {
      if (!existingTrackIds.has(track.id)) {
        this.peer.addTrack(track, stream);
      }
    });
  }

  removeStream(stream) {
    if (!this.peer || !stream) return;

    const trackIds = new Set(stream.getTracks().map((track) => track.id));
    this.peer.getSenders().forEach((sender) => {
      if (sender.track && trackIds.has(sender.track.id)) {
        this.peer.removeTrack(sender);
      }
    });
  }

  ensureReceivingTrack(kind) {
    if (!this.peer) return;

    const hasTransceiver = this.peer.getTransceivers().some((transceiver) => {
      return transceiver.sender?.track?.kind === kind || transceiver.receiver?.track?.kind === kind;
    });

    if (!hasTransceiver) {
      this.peer.addTransceiver(kind, { direction: "recvonly" });
    }
  }

  prepareConnection(stream) {
    this.addStream(stream);
    this.ensureReceivingTrack("audio");
    this.ensureReceivingTrack("video");
  }

  async getAnswer(offer) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(ans));
      return ans;
    }
  }

  async setLocalDescription(ans) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
  }

  async addIceCandidate(candidate) {
    if (this.peer && candidate) {
      await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  }
}

export default new PeerService();
