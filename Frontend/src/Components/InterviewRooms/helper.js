export const defaultCodes = {
    cpp: `#include<bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your code here\n\n    return 0;\n}`,
    c: `#include<stdio.h>\n\nint main() {\n    // Your code here\n\n    return 0;\n}`,
    java: `public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`,
    python: `def main():\n    # Your code here\n    pass\n\nif __name__ == "__main__":\n    main()`,
};

export const enterFullScreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    }if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  };

  export const generateRoomId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let roomId = '';
    for (let i = 0; i < 5; i++) {
        roomId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return roomId;
};