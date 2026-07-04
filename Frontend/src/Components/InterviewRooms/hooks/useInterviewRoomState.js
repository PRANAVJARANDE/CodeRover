import { useEffect, useState } from 'react';
import { defaultCodes } from '../helper.js';
import {
  getInterviewByRoomIdService,
  updateInterviewRoomStateService,
} from '../../../Services/Interview.service.js';

export const useInterviewRoomState = ({
  roomId,
  extraInfo,
  redirectingAfterRefresh,
  updateRemoteSocketId,
  setconnectionReady,
  code,
  language,
  question,
  cases,
  exampleCasesExecution,
  setCode,
  setLanguage,
  setquestion,
  setCases,
  setExampleCasesExecution,
}) => {
  const [roomParticipantRole, setRoomParticipantRole] = useState(extraInfo?.role || null);
  const [previlige, setprevilige] = useState(false);
  const [roomStateLoaded, setRoomStateLoaded] = useState(false);

  useEffect(() => {
    if (redirectingAfterRefresh) return;

    let cancelled = false;
    const initializeRoom = async () => {
      const nonparsedUser = localStorage.getItem('user');
      const user = JSON.parse(nonparsedUser);
      let resolvedRole = extraInfo?.role || null;
      const isLegacyHostState = (extraInfo?.user && extraInfo.user._id === user._id) || (extraInfo && extraInfo._id === user._id);

      if (!resolvedRole && isLegacyHostState) {
        resolvedRole = 'interviewer';
      }

      const interview = await getInterviewByRoomIdService(roomId);
      if (cancelled) return;

      if (interview?.roomState) {
        const {
          code: savedCode,
          language: savedLanguage,
          question: savedQuestion,
          cases: savedCases,
          exampleCasesExecution: savedExecution,
        } = interview.roomState;
        const nextLanguage = savedLanguage || 'cpp';
        setLanguage(nextLanguage);
        setCode(typeof savedCode === 'string' && savedCode.length ? savedCode : defaultCodes[nextLanguage] || defaultCodes.cpp);
        setquestion(savedQuestion || "");
        if (Array.isArray(savedCases) && savedCases.length) {
          setCases(savedCases);
        }
        if (savedExecution) {
          setExampleCasesExecution(savedExecution);
        }
      }

      if (!resolvedRole && interview) {
        if (user.email === interview.interviewer.email) resolvedRole = 'interviewer';
        else if (user.email === interview.interviewee.email) resolvedRole = 'interviewee';
      }

      setRoomParticipantRole(resolvedRole);
      setprevilige(resolvedRole === 'interviewer');
      setRoomStateLoaded(true);

      if (extraInfo?.remoteSocketId) {
        updateRemoteSocketId(extraInfo.remoteSocketId);
        setconnectionReady(true);
      } else if (typeof extraInfo === 'string') {
        updateRemoteSocketId(extraInfo);
        setconnectionReady(true);
      }
    };

    initializeRoom();
    return () => {
      cancelled = true;
    };
  }, [
    extraInfo,
    redirectingAfterRefresh,
    roomId,
    setCases,
    setCode,
    setExampleCasesExecution,
    setLanguage,
    setquestion,
    setconnectionReady,
    updateRemoteSocketId,
  ]);

  useEffect(() => {
    if (redirectingAfterRefresh || !roomStateLoaded) return;

    const autosaveTimer = setTimeout(() => {
      updateInterviewRoomStateService(roomId, {
        code,
        language,
        question,
        cases,
        exampleCasesExecution,
      });
    }, 600);

    return () => {
      clearTimeout(autosaveTimer);
    };
  }, [cases, code, exampleCasesExecution, language, question, redirectingAfterRefresh, roomId, roomStateLoaded]);

  return {
    roomParticipantRole,
    previlige,
    roomStateLoaded,
  };
};
