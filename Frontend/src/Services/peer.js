class PeerService {
    constructor() {
        if (!this.peer) {
            this.peer = new RTCPeerConnection({
                iceServers: [
                    { urls:[ 
                        'stun:stun.l.google.com:19302', 
                        'stun:global.stun.twilio.com:3478'
                    ]} 
                ]
            });
        }
        return PeerService.instance;
    }

    async createOffer() {
        try {
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            console.log('Created offer: ',offer);
            return offer;
        } catch (error) {
            console.log('Error creating offer:', error);
        }
    }

    async handleOffer(offer) {
        try {
            await this.peer.setRemoteDescription(offer);
            const answer = await this.peer.createAnswer();
            await this.peer.setLocalDescription(answer);
            console.log('Answer created:', answer);
            return answer;
        } catch (error) {
            console.log('Error handling offer:', error);
        }
    }

    async setLocalDescription(answer){
        if(this.peer)
        {
            await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }
}

export default new PeerService();
/* 
// Usage
const peerService1 = new PeerService();
const peerService2 = new PeerService();

console.log(peerService1 === peerService2); // true
 */