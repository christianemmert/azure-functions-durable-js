import * as moment from "moment";
import * as uuidv1 from "uuid/v1";
import {
    DurableHttpRequest,
    DurableHttpResponse,
    EntityId,
    EventRaisedEvent,
    EventSentEvent,
    ExecutionStartedEvent,
    HistoryEvent,
    OrchestratorCompletedEvent,
    OrchestratorStartedEvent,
    SubOrchestrationInstanceCompletedEvent,
    SubOrchestrationInstanceCreatedEvent,
    SubOrchestrationInstanceFailedEvent,
    TaskCompletedEvent,
    TaskFailedEvent,
    TaskScheduledEvent,
    TimerCreatedEvent,
    TimerFiredEvent,
} from "../../src/classes";

export class TestHistories {
    public static StarterHistory(timestamp: Date): HistoryEvent[] {
        return [
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: timestamp,
                isPlayed: false,
            }),
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp: timestamp,
                isPlayed: false,
                name: "",
                input: JSON.stringify("input"),
            }),
        ];
    }

    public static GetAnyAOrB(firstTimestamp: Date, completeInOrder: boolean): HistoryEvent[] {
        return [
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: true,
                name: "AnyAOrB",
                input: JSON.stringify(completeInOrder),
            }),
            new TaskScheduledEvent({
                eventId: 0,
                timestamp: firstTimestamp,
                isPlayed: false,
                name: "TaskA",
                input: JSON.stringify(completeInOrder),
            }),
            new TaskScheduledEvent({
                eventId: 1,
                timestamp: firstTimestamp,
                isPlayed: false,
                name: "TaskB",
                input: JSON.stringify(completeInOrder),
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
            }),
            new TaskCompletedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
                result: JSON.stringify(completeInOrder ? "A" : "B"),
                taskScheduledId: completeInOrder ? 0 : 1,
            }),
        ];
    }

    public static GetTimerActivityRaceActivityWinsHistory(
        firstTimestamp: Date,
        iteration: number
    ): HistoryEvent[] {
        const fireAt = moment(firstTimestamp).add(1, "s").toDate();
        const secondIteration = moment(firstTimestamp).add(500, "ms").toDate();
        const thirdIteration = moment(firstTimestamp).add(1100, "ms").toDate();
        const finalIteration = moment(firstTimestamp).add(2, "s").toDate();

        const history = [];

        if (iteration >= 1) {
            history.push(
                new OrchestratorStartedEvent({
                    eventId: -1,
                    timestamp: firstTimestamp,
                    isPlayed: false,
                })
            );
            history.push(
                new ExecutionStartedEvent({
                    eventId: -1,
                    timestamp: firstTimestamp,
                    isPlayed: true,
                    name: "TimerActivityRace",
                })
            );
            history.push(
                new TimerCreatedEvent({
                    eventId: 0,
                    timestamp: firstTimestamp,
                    isPlayed: false,
                    fireAt,
                })
            );
            history.push(
                new TaskScheduledEvent({
                    eventId: 1,
                    timestamp: firstTimestamp,
                    isPlayed: iteration > 1,
                    name: "TaskA",
                })
            );
            history.push(
                new OrchestratorCompletedEvent({
                    eventId: -1,
                    timestamp: firstTimestamp,
                    isPlayed: iteration > 1,
                })
            );
        }

        if (iteration >= 2) {
            history.push(
                new OrchestratorStartedEvent({
                    eventId: -1,
                    timestamp: secondIteration,
                    isPlayed: iteration > 2,
                })
            );
            history.push(
                new TaskCompletedEvent({
                    eventId: -1,
                    timestamp: secondIteration,
                    isPlayed: iteration > 2,
                    taskScheduledId: 1,
                    result: "{}",
                })
            );
            history.push(
                new TaskScheduledEvent({
                    eventId: 2,
                    timestamp: secondIteration,
                    isPlayed: iteration > 2,
                    name: "TaskB",
                })
            );
            history.push(
                new OrchestratorCompletedEvent({
                    eventId: -1,
                    timestamp: firstTimestamp,
                    isPlayed: iteration > 2,
                })
            );
        }

        if (iteration >= 3) {
            history.push(
                new OrchestratorStartedEvent({
                    eventId: -1,
                    timestamp: thirdIteration,
                    isPlayed: iteration > 3,
                })
            );
            history.push(
                new TimerFiredEvent({
                    eventId: -1,
                    timestamp: firstTimestamp,
                    fireAt,
                    isPlayed: iteration > 3,
                    timerId: 0,
                })
            );
            history.push(
                new OrchestratorCompletedEvent({
                    eventId: -1,
                    timestamp: thirdIteration,
                    isPlayed: iteration > 3,
                })
            );
        }

        if (iteration === 4) {
            history.push(
                new OrchestratorStartedEvent({
                    eventId: -1,
                    timestamp: finalIteration,
                    isPlayed: false,
                })
            );
            history.push(
                new TaskCompletedEvent({
                    eventId: -1,
                    timestamp: thirdIteration,
                    isPlayed: false,
                    taskScheduledId: 2,
                    result: "{}",
                })
            );
            history.push(
                new OrchestratorCompletedEvent({
                    eventId: -1,
                    timestamp: finalIteration,
                    isPlayed: false,
                })
            );
        }

        return history;
    }

    public static GetTimerActivityRaceTimerWinsHistory(
        firstTimestamp: Date,
        iteration: number
    ): HistoryEvent[] {
        const fireAt = moment(firstTimestamp).add(1, "s").toDate();
        const secondIteration = moment(firstTimestamp).add(1100, "ms").toDate();

        const history = [];
        if (iteration >= 1) {
            history.push(
                new OrchestratorStartedEvent({
                    eventId: -1,
                    timestamp: firstTimestamp,
                    isPlayed: false,
                })
            );
            history.push(
                new ExecutionStartedEvent({
                    eventId: -1,
                    timestamp: firstTimestamp,
                    isPlayed: true,
                    name: "TimerActivityRace",
                })
            );
            history.push(
                new TimerCreatedEvent({
                    eventId: 0,
                    timestamp: firstTimestamp,
                    isPlayed: false,
                    fireAt,
                })
            );
            history.push(
                new TaskScheduledEvent({
                    eventId: 1,
                    timestamp: firstTimestamp,
                    isPlayed: iteration > 1,
                    name: "TaskA",
                })
            );
            history.push(
                new OrchestratorCompletedEvent({
                    eventId: -1,
                    timestamp: firstTimestamp,
                    isPlayed: iteration > 1,
                })
            );
        }

        if (iteration >= 2) {
            history.push(
                new OrchestratorStartedEvent({
                    eventId: -1,
                    timestamp: secondIteration,
                    isPlayed: iteration > 2,
                })
            );
            history.push(
                new TimerFiredEvent({
                    eventId: -1,
                    timestamp: firstTimestamp,
                    fireAt,
                    isPlayed: iteration > 2,
                    timerId: 0,
                })
            );
        }

        return history;
    }

    public static GetAnyWithTaskSet(
        firstTimestamp: Date,
        iteration: number,
        eventsBeatTimer: boolean
    ): HistoryEvent[] {
        const fireAt = moment(firstTimestamp).add(300, "s").toDate();

        const history = [];

        if (iteration >= 1) {
            history.push(
                new OrchestratorStartedEvent({
                    eventId: -1,
                    timestamp: firstTimestamp,
                    isPlayed: false,
                })
            );
            history.push(
                new ExecutionStartedEvent({
                    eventId: -1,
                    timestamp: firstTimestamp,
                    isPlayed: true,
                    name: "AnyWithTaskSet",
                })
            );
            history.push(
                new TimerCreatedEvent({
                    eventId: 0,
                    timestamp: firstTimestamp,
                    isPlayed: false,
                    fireAt,
                })
            );
            history.push(
                new OrchestratorCompletedEvent({
                    eventId: -1,
                    timestamp: firstTimestamp,
                    isPlayed: iteration > 1,
                })
            );
        }

        if (iteration >= 2) {
            const secondIteration: Date = eventsBeatTimer
                ? moment(firstTimestamp).add(2500, "ms").toDate()
                : moment(firstTimestamp).add(31500, "ms").toDate();

            history.push(
                new OrchestratorStartedEvent({
                    eventId: -1,
                    timestamp: secondIteration,
                    isPlayed: iteration > 2,
                })
            );
            history.push(
                new EventRaisedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp).add(2, "s").toDate(),
                    isPlayed: false,
                    name: "firstRequiredEvent",
                })
            );
            if (eventsBeatTimer) {
                history.push(
                    new EventRaisedEvent({
                        eventId: -1,
                        timestamp: moment(firstTimestamp).add(2, "s").toDate(),
                        isPlayed: false,
                        name: "secondRequiredEvent",
                    })
                );
                history.push(
                    new TimerFiredEvent({
                        eventId: -1,
                        timestamp: firstTimestamp,
                        fireAt,
                        isPlayed: false,
                        timerId: 0,
                    })
                );
            } else {
                history.push(
                    new TimerFiredEvent({
                        eventId: -1,
                        timestamp: firstTimestamp,
                        fireAt,
                        isPlayed: false,
                        timerId: 0,
                    })
                );
                history.push(
                    new EventRaisedEvent({
                        eventId: -1,
                        timestamp: moment(firstTimestamp).add(3, "s").toDate(),
                        isPlayed: false,
                        name: "secondRequiredEvent",
                    })
                );
            }
        }

        return history;
    }

    public static GetCallEntitySet(firstTimestamp: Date, entityId: EntityId): HistoryEvent[] {
        const orchestratorId = uuidv1();
        const messageId = uuidv1();

        return [
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: true,
                name: orchestratorId,
                input: JSON.stringify(entityId),
            }),
            new EventSentEvent({
                eventId: 0,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: true,
                name: "op",
                input: JSON.stringify({
                    id: messageId,
                    op: "set",
                    parent: orchestratorId,
                    timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                }),
                instanceId: EntityId.getSchedulerIdFromEntityId(entityId),
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: true,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(2, "s").toDate(),
                isPlayed: false,
            }),
            new EventRaisedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(2, "s").toDate(),
                isPlayed: false,
                name: messageId,
                input: JSON.stringify({
                    result: null,
                }),
            }),
        ];
    }

    public static GetFanOutFanInDiskUsageComplete(
        firstTimestamp: Date,
        files: string[]
    ): HistoryEvent[] {
        return [
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: true,
                name: "FanOutFanInDiskUsage",
                input: undefined,
            }),
            new TaskScheduledEvent({
                eventId: 0,
                timestamp: firstTimestamp,
                isPlayed: false,
                name: "GetFileList",
                input: "C:\\Dev",
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
            }),
            new TaskCompletedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
                result: JSON.stringify(files),
                taskScheduledId: 0,
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(2, "s").toDate(),
                isPlayed: false,
            }),
        ]
            .concat(
                files.map(
                    (file, index) =>
                        new TaskScheduledEvent({
                            eventId: index + 1,
                            timestamp: moment(firstTimestamp).add(2, "s").toDate(),
                            isPlayed: false,
                            name: "GetFileSize",
                            input: file,
                        })
                )
            )
            .concat([
                new OrchestratorCompletedEvent({
                    eventId: -1,
                    timestamp: firstTimestamp,
                    isPlayed: false,
                }),
                new OrchestratorStartedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp).add(2, "s").toDate(),
                    isPlayed: false,
                }),
                new TaskCompletedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp).add(3, "s").toDate(),
                    isPlayed: false,
                    result: JSON.stringify(1),
                    taskScheduledId: 1,
                }),
                new TaskCompletedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp).add(3, "s").toDate(),
                    isPlayed: false,
                    result: JSON.stringify(2),
                    taskScheduledId: 2,
                }),
                new OrchestratorCompletedEvent({
                    eventId: -1,
                    timestamp: firstTimestamp,
                    isPlayed: false,
                }),
                new OrchestratorStartedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp).add(4, "s").toDate(),
                    isPlayed: false,
                }),
                new TaskCompletedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp).add(4, "s").toDate(),
                    isPlayed: false,
                    result: JSON.stringify(3),
                    taskScheduledId: 3,
                }),
            ]);
    }

    public static GetFanOutFanInDiskUsageFaulted(
        firstTimestamp: Date,
        files: string[]
    ): HistoryEvent[] {
        return [
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: true,
                name: "FanOutFanInDiskUsage",
                input: undefined,
            }),
            new TaskScheduledEvent({
                eventId: 0,
                timestamp: firstTimestamp,
                isPlayed: false,
                name: "GetFileList",
                input: "C:\\Dev",
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
            }),
            new TaskCompletedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
                result: JSON.stringify(files),
                taskScheduledId: 0,
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(2, "s").toDate(),
                isPlayed: false,
            }),
        ]
            .concat(
                files.map(
                    (file, index) =>
                        new TaskScheduledEvent({
                            eventId: index + 1,
                            timestamp: moment(firstTimestamp).add(2, "s").toDate(),
                            isPlayed: false,
                            name: "GetFileSize",
                            input: file,
                        })
                )
            )
            .concat([
                new OrchestratorCompletedEvent({
                    eventId: -1,
                    timestamp: firstTimestamp,
                    isPlayed: false,
                }),
                new OrchestratorStartedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp).add(4, "s").toDate(),
                    isPlayed: false,
                }),
                new TaskCompletedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp).add(3, "s").toDate(),
                    isPlayed: false,
                    result: JSON.stringify(1),
                    taskScheduledId: 1,
                }),
                new TaskFailedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp).add(3, "s").toDate(),
                    isPlayed: false,
                    result: JSON.stringify(2),
                    taskScheduledId: 2,
                    reason: `Activity function 'GetFileSize' failed: Could not find file ${files[1]}`,
                    details: "Serialized System.Exception here",
                }),
                new TaskFailedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp).add(4, "s").toDate(),
                    isPlayed: false,
                    taskScheduledId: 3,
                    reason: `Activity function 'GetFileSize' failed: Could not find file ${files[2]}`,
                    details: "Serialized System.Exception here",
                }),
            ]);
    }

    public static GetFanOutFanInDiskUsagePartComplete(
        firstTimestamp: Date,
        files: string[]
    ): HistoryEvent[] {
        return [
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: true,
                name: "FanOutFanInDiskUsage",
                input: undefined,
            }),
            new TaskScheduledEvent({
                eventId: 0,
                timestamp: firstTimestamp,
                isPlayed: false,
                name: "GetFileList",
                input: "C:\\Dev",
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
            }),
            new TaskCompletedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
                result: JSON.stringify(files),
                taskScheduledId: 0,
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(2, "s").toDate(),
                isPlayed: false,
            }),
        ]
            .concat(
                files.map(
                    (file, index) =>
                        new TaskScheduledEvent({
                            eventId: index + 1,
                            timestamp: moment(firstTimestamp).add(2, "s").toDate(),
                            isPlayed: false,
                            name: "GetFileSize",
                            input: file,
                        })
                )
            )
            .concat([
                new OrchestratorCompletedEvent({
                    eventId: -1,
                    timestamp: firstTimestamp,
                    isPlayed: false,
                }),
                new OrchestratorStartedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp).add(3, "s").toDate(),
                    isPlayed: false,
                }),
                new TaskCompletedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp).add(3, "s").toDate(),
                    isPlayed: false,
                    result: JSON.stringify(2),
                    taskScheduledId: 2,
                }),
            ]);
    }

    public static GetFanOutFanInDiskUsageReplayOne(
        firstTimestamp: Date,
        files: string[]
    ): HistoryEvent[] {
        return [
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: true,
                name: "FanOutFanInDiskUsage",
                input: undefined,
            }),
            new TaskScheduledEvent({
                eventId: 0,
                timestamp: firstTimestamp,
                isPlayed: false,
                name: "GetFileList",
                input: "C:\\Dev",
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
            }),
            new TaskCompletedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
                result: JSON.stringify(files),
                taskScheduledId: 0,
            }),
        ];
    }

    public static GetHelloSequenceReplayFinal(name: string, firstTimestamp: Date): HistoryEvent[] {
        return [
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: true,
                name,
                input: undefined,
            }),
            new TaskScheduledEvent({
                eventId: 0,
                timestamp: firstTimestamp,
                isPlayed: false,
                name: "Hello",
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
            }),
            new TaskCompletedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: true,
                result: JSON.stringify("Hello, Tokyo!"),
                taskScheduledId: 0,
            }),
            new TaskScheduledEvent({
                eventId: 1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
                name: "Hello",
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(2, "s").toDate(),
                isPlayed: false,
            }),
            new TaskCompletedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(2, "s").toDate(),
                isPlayed: true,
                result: JSON.stringify("Hello, Seattle!"),
                taskScheduledId: 1,
            }),
            new TaskScheduledEvent({
                eventId: 2,
                timestamp: moment(firstTimestamp).add(2, "s").toDate(),
                isPlayed: false,
                name: "Hello",
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(2, "s").toDate(),
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
            }),
            new TaskCompletedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(3, "s").toDate(),
                isPlayed: true,
                result: JSON.stringify("Hello, London!"),
                taskScheduledId: 2,
            }),
        ];
    }

    public static GetOrchestratorStart(
        name: string,
        firstTimestamp: Date,
        input?: unknown
    ): HistoryEvent[] {
        return [
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(5, "ms").toDate(),
                isPlayed: false,
                name,
                input: JSON.stringify(input),
            }),
        ];
    }

    /**
     * This history and its corresponding orchestrator replicate conditions under
     * which there are not sufficient OrchestratorStartedEvents in the history
     * array to satisfy the currentUtcDateTime advancement logic.
     */
    public static GetTimestampExhaustion(firstTimestamp: Date): HistoryEvent[] {
        const firstTime = firstTimestamp.getTime();
        const timestamps: Date[] = [];
        for (let i = 0; i < 9; i++) {
            timestamps[i] = new Date(firstTime + 1000 * i);
        }

        return [
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: timestamps[0],
                isPlayed: false,
            }),
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp: timestamps[0],
                isPlayed: true,
                name: "TimestampExhaustion",
                input: JSON.stringify({ delayMergeUntilSecs: 1 }),
            }),
            new EventRaisedEvent({
                eventId: -1,
                timestamp: timestamps[0],
                isPlayed: true,
                name: "CheckPrForMerge",
                input: JSON.stringify({ value: 0 }),
            }),
            new TaskScheduledEvent({
                eventId: 0,
                timestamp: timestamps[0],
                isPlayed: false,
                name: "Merge",
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: timestamps[0],
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: timestamps[1],
                isPlayed: false,
            }),
            new EventRaisedEvent({
                eventId: -1,
                timestamp: timestamps[1],
                isPlayed: true,
                name: "CheckPrForMerge",
                input: JSON.stringify({ value: 1 }),
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: timestamps[1],
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: timestamps[2],
                isPlayed: false,
            }),
            new TaskCompletedEvent({
                eventId: -1,
                timestamp: timestamps[2],
                isPlayed: true,
                taskScheduledId: 0,
                result: JSON.stringify(""),
            }),
            new TimerCreatedEvent({
                eventId: 1,
                timestamp: timestamps[2],
                isPlayed: false,
                fireAt: timestamps[2],
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: timestamps[2],
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: timestamps[3],
                isPlayed: false,
            }),
            new TimerFiredEvent({
                eventId: -1,
                timestamp: timestamps[3],
                isPlayed: true,
                fireAt: timestamps[2],
                timerId: 1,
            }),
            new TimerFiredEvent({
                eventId: -1,
                timestamp: timestamps[3],
                isPlayed: true,
                fireAt: timestamps[2],
                timerId: 1,
            }),
            new TaskScheduledEvent({
                eventId: 2,
                timestamp: timestamps[3],
                isPlayed: false,
                name: "CheckIfMerged",
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: timestamps[3],
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: timestamps[4],
                isPlayed: false,
            }),
            new TaskCompletedEvent({
                eventId: -1,
                timestamp: timestamps[4],
                isPlayed: true,
                taskScheduledId: 2,
                result: JSON.stringify({ output: false }),
            }),
            new TaskScheduledEvent({
                eventId: 3,
                timestamp: timestamps[4],
                isPlayed: false,
                name: "CheckIfMerged",
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: timestamps[4],
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: timestamps[5],
                isPlayed: false,
            }),
            new TaskCompletedEvent({
                eventId: -1,
                timestamp: timestamps[5],
                isPlayed: true,
                taskScheduledId: 3,
                result: JSON.stringify({ output: false }),
            }),
            new TaskScheduledEvent({
                eventId: 4,
                timestamp: timestamps[5],
                isPlayed: false,
                name: "CheckIfMerged",
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: timestamps[5],
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: timestamps[6],
                isPlayed: false,
            }),
            new TaskCompletedEvent({
                eventId: -1,
                timestamp: timestamps[6],
                isPlayed: true,
                taskScheduledId: 4,
                result: JSON.stringify({ output: false }),
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: timestamps[6],
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: timestamps[7],
                isPlayed: false,
            }),
            new EventRaisedEvent({
                eventId: -1,
                timestamp: timestamps[7],
                isPlayed: true,
                name: "CheckPrForMerge",
                input: JSON.stringify({ value: 2 }),
            }),
            new EventRaisedEvent({
                eventId: -1,
                timestamp: timestamps[7],
                isPlayed: true,
                name: "CheckPrForMerge",
                input: JSON.stringify({ value: 3 }),
            }),
            new EventRaisedEvent({
                eventId: -1,
                timestamp: timestamps[7],
                isPlayed: true,
                name: "CheckPrForMerge",
                input: JSON.stringify({ value: 4 }),
            }),
            new TaskScheduledEvent({
                eventId: 5,
                timestamp: timestamps[7],
                isPlayed: false,
                name: "CheckIfMerged",
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: timestamps[7],
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: timestamps[8],
                isPlayed: false,
            }),
            new TaskCompletedEvent({
                eventId: -1,
                timestamp: timestamps[8],
                isPlayed: false,
                taskScheduledId: 5,
                result: JSON.stringify({ output: false }),
            }),
        ];
    }

    public static GetSayHelloWithActivityReplayOne(
        name: string,
        firstTimestamp: Date,
        input: unknown
    ): HistoryEvent[] {
        return [
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: true,
                name,
                input: JSON.stringify(input),
            }),
            new TaskScheduledEvent({
                eventId: 0,
                timestamp: firstTimestamp,
                isPlayed: false,
                name: "Hello",
                input: JSON.stringify(input),
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
            }),
            new TaskCompletedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
                result: JSON.stringify(`Hello, ${input}!`),
                taskScheduledId: 0,
            }),
        ];
    }

    public static GetSayHelloWithActivityRetryFailOne(
        firstTimestamp: Date,
        input: unknown
    ): HistoryEvent[] {
        return [
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: true,
                name: "SayHelloWithActivityRetry",
                input: JSON.stringify(input),
            }),
            new TaskScheduledEvent({
                eventId: 0,
                timestamp: firstTimestamp,
                isPlayed: false,
                name: "Hello",
                input: undefined,
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
            }),
            new TaskFailedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
                taskScheduledId: 0,
                details: "Big stack trace here",
                reason: "Activity function 'Hello' failed: Result: Failure",
            }),
        ];
    }

    public static GetSayHelloWithActivityRetryRetryOne(
        firstTimestamp: Date,
        input: unknown,
        retryInterval: number
    ): HistoryEvent[] {
        return [
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: true,
                name: "SayHelloWithActivityRetry",
                input: JSON.stringify(input),
            }),
            new TaskScheduledEvent({
                eventId: 0,
                timestamp: firstTimestamp,
                isPlayed: false,
                name: "Hello",
                input: undefined,
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
            }),
            new TaskFailedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
                taskScheduledId: 0,
                details: "Big stack trace here",
                reason: "Activity function 'Hello' failed: Result: Failure",
            }),
            new TimerCreatedEvent({
                eventId: 1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
                fireAt: moment(firstTimestamp).add(1, "s").add(retryInterval, "ms").toDate(),
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").add(retryInterval, "ms").toDate(),
                isPlayed: false,
            }),
            new TimerFiredEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").add(retryInterval, "ms").toDate(),
                isPlayed: false,
                fireAt: moment(firstTimestamp).add(1, "s").add(retryInterval, "ms").toDate(),
                timerId: 1,
            }),
        ];
    }

    public static GetSayHelloWithActivityRetryRetryTwo(
        firstTimestamp: Date,
        input: unknown,
        retryInterval: number
    ): HistoryEvent[] {
        const history: HistoryEvent[] = [];
        let timestamp = firstTimestamp;

        history.push(
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp,
                isPlayed: false,
            }),
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp,
                isPlayed: true,
                name: "SayHelloWithActivityRetry",
                input: JSON.stringify(input),
            }),
            new TaskScheduledEvent({
                eventId: 0,
                timestamp,
                isPlayed: false,
                name: "Hello",
                input: undefined,
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp,
                isPlayed: false,
            })
        );

        timestamp = moment(firstTimestamp).add(30, "s").toDate();

        history.push(
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp,
                isPlayed: false,
            }),
            new TaskFailedEvent({
                eventId: -1,
                timestamp,
                isPlayed: false,
                taskScheduledId: 0,
                details: "Big stack trace here",
                reason: "Activity function 'Hello' failed: Result: Failure",
            }),
            new TimerCreatedEvent({
                eventId: 1,
                timestamp,
                isPlayed: false,
                fireAt: moment(timestamp).add(retryInterval, "ms").toDate(),
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp,
                isPlayed: false,
            })
        );

        // These artificial delays between fireAt and timestamp is because
        // in reality, timers don't fire exactly at their fireAt time
        let fireAt = moment(timestamp).add(retryInterval, "ms").toDate();
        timestamp = moment(fireAt).add(10, "s").toDate();

        history.push(
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp,
                isPlayed: false,
            }),
            new TimerFiredEvent({
                eventId: -1,
                timestamp,
                isPlayed: false,
                fireAt,
                timerId: 1,
            }),
            new TaskScheduledEvent({
                eventId: 2,
                timestamp,
                isPlayed: false,
                name: "Hello",
                input: undefined,
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp,
                isPlayed: false,
            })
        );

        timestamp = moment(timestamp).add(20, "s").toDate();

        history.push(
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp,
                isPlayed: false,
            }),
            new TaskFailedEvent({
                eventId: -1,
                timestamp,
                isPlayed: false,
                taskScheduledId: 2,
                details: "Big stack trace here",
                reason: "Activity function 'Hello' failed: Result: Failure",
            }),
            new TimerCreatedEvent({
                eventId: 3,
                timestamp,
                isPlayed: false,
                fireAt: moment(timestamp).add(retryInterval, "ms").toDate(),
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp,
                isPlayed: false,
            })
        );

        fireAt = moment(timestamp).add(retryInterval, "ms").toDate();
        timestamp = moment(fireAt).add(10, "s").toDate();

        history.push(
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp,
                isPlayed: false,
            }),
            new TimerFiredEvent({
                eventId: -1,
                timestamp,
                isPlayed: false,
                fireAt,
                timerId: 3,
            })
        );

        return history;
    }

    public static GetSimpleFanOut(firstTimestamp: Date) {
        const historyEvents: HistoryEvent[] = [];

        historyEvents.push(
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: true,
            })
        );
        historyEvents.push(
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: true,
                name: "SayHelloWithActivityRetryFanout",
                input: undefined,
            })
        );
        historyEvents.push(
            new TaskScheduledEvent({
                eventId: 0,
                timestamp: firstTimestamp,
                isPlayed: true,
                name: "Hello",
                input: "Tokyo",
            })
        );
        historyEvents.push(
            new TaskScheduledEvent({
                eventId: 1,
                timestamp: firstTimestamp,
                isPlayed: true,
                name: "Hello",
                input: "Seattle",
            })
        );
        historyEvents.push(
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: true,
            })
        );

        historyEvents.push(
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(100, "s").toDate(),
                isPlayed: true,
            })
        );
        historyEvents.push(
            new TaskCompletedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(100, "s").toDate(),
                isPlayed: true,
                result: JSON.stringify(`Hello, Tokyo!`),
                taskScheduledId: 0,
            })
        );

        historyEvents.push(
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(100, "s").toDate(),
                isPlayed: false,
            })
        );
        historyEvents.push(
            new TaskCompletedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(100, "s").toDate(),
                isPlayed: false,
                result: JSON.stringify(`Hello, Seattle!`),
                taskScheduledId: 1,
            })
        );

        return historyEvents;
    }

    public static GetSayHelloWithActivityRetryFanout(
        firstTimestamp: Date,
        retryInterval: number,
        iteration: number
    ): HistoryEvent[] {
        const historyEvents: HistoryEvent[] = [];
        if (iteration >= 1) {
            historyEvents.push(
                new OrchestratorStartedEvent({
                    eventId: -1,
                    timestamp: firstTimestamp,
                    isPlayed: iteration > 1,
                })
            );
            historyEvents.push(
                new ExecutionStartedEvent({
                    eventId: -1,
                    timestamp: firstTimestamp,
                    isPlayed: iteration > 1,
                    name: "SayHelloWithActivityRetryFanout",
                    input: undefined,
                })
            );
            historyEvents.push(
                new TaskScheduledEvent({
                    eventId: 0,
                    timestamp: firstTimestamp,
                    isPlayed: iteration > 1,
                    name: "Hello",
                    input: "Tokyo",
                })
            );
            historyEvents.push(
                new TaskScheduledEvent({
                    eventId: 1,
                    timestamp: firstTimestamp,
                    isPlayed: iteration > 1,
                    name: "Hello",
                    input: "Seattle",
                })
            );
            historyEvents.push(
                new OrchestratorCompletedEvent({
                    eventId: -1,
                    timestamp: firstTimestamp,
                    isPlayed: iteration > 1,
                })
            );
        }

        if (iteration >= 2) {
            historyEvents.push(
                new OrchestratorStartedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp).add(110, "ms").toDate(),
                    isPlayed: iteration > 2,
                })
            );
            historyEvents.push(
                new TaskFailedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp).add(100, "ms").toDate(),
                    isPlayed: iteration > 2,
                    taskScheduledId: 0,
                    details: "Big stack trace here",
                    reason: "Activity function 'Hello' failed: Result: Failure",
                })
            );
            historyEvents.push(
                new TimerCreatedEvent({
                    eventId: 2,
                    timestamp: moment(firstTimestamp).add(100, "ms").toDate(),
                    isPlayed: iteration > 2,
                    fireAt: moment(firstTimestamp).add(100, "ms").add(retryInterval, "ms").toDate(),
                })
            );
            historyEvents.push(
                new TaskCompletedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp)
                        .add(100, "s")
                        .add(retryInterval, "ms")
                        .add(100, "ms")
                        .toDate(),
                    isPlayed: iteration > 2,
                    result: JSON.stringify(`Hello, Seattle!`),
                    taskScheduledId: 1,
                })
            );
            historyEvents.push(
                new OrchestratorCompletedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp).add(100, "ms").toDate(),
                    isPlayed: iteration > 2,
                })
            );
        }

        if (iteration >= 3) {
            historyEvents.push(
                new OrchestratorStartedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp).add(1, "s").add(retryInterval, "ms").toDate(),
                    isPlayed: iteration > 3,
                })
            );
            historyEvents.push(
                new TimerFiredEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp)
                        .add(100, "ms")
                        .add(retryInterval, "ms")
                        .toDate(),
                    isPlayed: iteration > 3,
                    fireAt: moment(firstTimestamp).add(100, "s").add(retryInterval, "ms").toDate(),
                    timerId: 2,
                })
            );
            historyEvents.push(
                new TaskScheduledEvent({
                    eventId: 3,
                    timestamp: moment(firstTimestamp)
                        .add(100, "ms")
                        .add(retryInterval, "ms")
                        .toDate(),
                    isPlayed: iteration > 3,
                    name: "Hello",
                    input: "Tokyo",
                })
            );
            historyEvents.push(
                new OrchestratorCompletedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp).add(100, "ms").toDate(),
                    isPlayed: iteration > 3,
                })
            );
        }

        if (iteration >= 4) {
            historyEvents.push(
                new OrchestratorStartedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp)
                        .add(100, "s")
                        .add(retryInterval, "ms")
                        .add(100, "ms")
                        .toDate(),
                    isPlayed: iteration > 3,
                })
            );
            historyEvents.push(
                new TaskCompletedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp)
                        .add(100, "s")
                        .add(retryInterval, "ms")
                        .add(100, "ms")
                        .toDate(),
                    isPlayed: false,
                    result: JSON.stringify(`Hello, Tokyo!`),
                    taskScheduledId: 3,
                })
            );
        }

        return historyEvents;
    }

    public static GetSendHttpRequestReplayOne(
        name: string,
        firstTimestamp: Date,
        request: DurableHttpRequest,
        response: DurableHttpResponse,
        taskId = 0
    ): HistoryEvent[] {
        return [
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: true,
                name,
                input: JSON.stringify(request),
            }),
            new TaskScheduledEvent({
                eventId: taskId,
                timestamp: firstTimestamp,
                isPlayed: false,
                name: "BuiltIn::HttpActivity",
                input: JSON.stringify(request),
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
            }),
            new TaskCompletedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
                result: JSON.stringify(response),
                taskScheduledId: taskId,
            }),
        ];
    }

    public static GetPendingHttpPollingRequest(
        firstTimestamp: Date,
        request: DurableHttpRequest,
        defaultHttpAsyncRequestSleepTimeMillseconds: number
    ): HistoryEvent[] {
        let timestamp = firstTimestamp;
        const redirectResponse = new DurableHttpResponse(202, undefined, { Location: request.uri });
        const history: HistoryEvent[] = [];
        history.push(
            ...this.GetSendHttpRequestReplayOne(
                "SendHttpRequest",
                timestamp,
                request,
                redirectResponse
            )
        );

        timestamp = moment(timestamp).add(1, "s").toDate();

        history.push(
            ...this.TimerCreated(
                timestamp,
                moment(timestamp).add(defaultHttpAsyncRequestSleepTimeMillseconds, "ms").toDate(),
                1
            )
        );

        timestamp = moment(timestamp)
            .add(defaultHttpAsyncRequestSleepTimeMillseconds, "ms")
            .toDate();

        history.push(...this.TimerFired(timestamp, 1));

        timestamp = moment(timestamp).add(1, "s").toDate();

        history.push(
            ...this.GetSendHttpRequestReplayOne(
                "SendHttpRequest",
                timestamp,
                request,
                redirectResponse,
                2
            )
        );
        return history;
    }

    public static GetCompletedHttpRequestWithPolling(
        firstTimestamp: Date,
        request: DurableHttpRequest,
        finalResponse: DurableHttpResponse,
        defaultHttpAsyncRequestSleepTimeMillseconds: number
    ): HistoryEvent[] {
        let timestamp = firstTimestamp;
        const redirectResponse = new DurableHttpResponse(202, undefined, { Location: request.uri });
        const history = [];
        history.push(
            ...this.GetSendHttpRequestReplayOne(
                "SendHttpRequest",
                timestamp,
                request,
                redirectResponse
            )
        );
        timestamp = moment(timestamp).add(1, "s").toDate();

        history.push(
            ...this.TimerCreated(
                timestamp,
                moment(timestamp).add(defaultHttpAsyncRequestSleepTimeMillseconds, "ms").toDate(),
                1
            )
        );

        timestamp = moment(timestamp)
            .add(defaultHttpAsyncRequestSleepTimeMillseconds, "ms")
            .toDate();

        history.push(...this.TimerFired(timestamp, 1));

        history.push(
            ...this.GetSendHttpRequestReplayOne(
                "SendHttpRequest",
                timestamp,
                request,
                finalResponse,
                2
            )
        );

        return history;
    }

    public static GetCallHttpWithPollingFailedRequest(
        firstTimestamp: Date,
        request: DurableHttpRequest,
        defaultHttpAsyncRequestSleepTimeMillseconds: number
    ): HistoryEvent[] {
        let timestamp = firstTimestamp;
        const redirectResponse = new DurableHttpResponse(202, undefined, { Location: request.uri });
        const history: HistoryEvent[] = [];
        history.push(
            ...this.GetSendHttpRequestReplayOne(
                "SendHttpRequest",
                timestamp,
                request,
                redirectResponse
            )
        );

        timestamp = moment(timestamp).add(1, "s").toDate();

        history.push(
            ...this.TimerCreated(
                timestamp,
                moment(timestamp).add(defaultHttpAsyncRequestSleepTimeMillseconds, "ms").toDate(),
                1
            )
        );

        timestamp = moment(timestamp)
            .add(defaultHttpAsyncRequestSleepTimeMillseconds, "ms")
            .toDate();

        history.push(...this.TimerFired(timestamp, 1));

        timestamp = moment(timestamp).add(1, "s").toDate();

        history.push(
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp,
                isPlayed: false,
            }),
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp,
                isPlayed: true,
                name: "HttpSendRequest",
                input: JSON.stringify(request),
            }),
            new TaskScheduledEvent({
                eventId: 2,
                timestamp,
                isPlayed: false,
                name: "BuiltIn::HttpActivity",
                input: JSON.stringify(request),
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp,
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(timestamp).add(1, "s").toDate(),
                isPlayed: false,
            }),
            new TaskFailedEvent({
                eventId: -1,
                timestamp: moment(timestamp).add(1, "s").toDate(),
                isPlayed: false,
                taskScheduledId: 2,
                details: "Big stack trace here",
                reason: "Activity function 'BuiltIn::HttpActivity' failed: Result: Failure",
            })
        );
        return history;
    }

    public static GetSayHelloWithSubOrchestratorReplayOne(
        firstTimestamp: Date,
        orchestratorName: string,
        subOrchestratorName: string,
        subInstanceId: string,
        input?: string
    ): HistoryEvent[] {
        return [
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: true,
                name: orchestratorName,
                input,
            }),
            new SubOrchestrationInstanceCreatedEvent({
                eventId: 0,
                timestamp: firstTimestamp,
                isPlayed: false,
                name: subOrchestratorName,
                input,
                instanceId: subInstanceId,
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
            }),
            new SubOrchestrationInstanceCompletedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
                result: JSON.stringify(`Hello, ${input}!`),
                taskScheduledId: 0,
            }),
        ];
    }

    // Covers the scenario for TestOrchestrations.MultipleSubOrchestratorNoSubId in which
    // all of the scheduled sub orchestrations are completed around the same time and processed
    // in the same orchestration replay.
    public static GetMultipleSubOrchestratorNoIdsSubOrchestrationsFinished(
        firstTimestamp: Date,
        orchestratorName: string,
        subOrchestratorNames: string[],
        input: string
    ): HistoryEvent[] {
        const baseSubInstanceId = "dummy-unique-id";
        const historyEvents = [
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: true,
                name: orchestratorName,
                input,
            }),
        ];
        for (let i = 0; i < subOrchestratorNames.length; i++) {
            historyEvents.push(
                new SubOrchestrationInstanceCreatedEvent({
                    eventId: i,
                    timestamp: firstTimestamp,
                    isPlayed: false,
                    name: subOrchestratorNames[i],
                    input: `${input}_${subOrchestratorNames[i]}_${i}`,
                    instanceId: `${baseSubInstanceId}_${i}`,
                })
            );
        }
        historyEvents.push(
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
            })
        );

        for (let i = 0; i < subOrchestratorNames.length; i++) {
            historyEvents.push(
                new SubOrchestrationInstanceCompletedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                    isPlayed: false,
                    result: JSON.stringify(`Hello, ${input}_${subOrchestratorNames[i]}_${i}!`),
                    taskScheduledId: i,
                })
            );
        }

        return historyEvents;
    }

    public static GetSayHelloWithSubOrchestratorFail(
        firstTimestamp: Date,
        orchestratorName: string,
        subOrchestratorName: string,
        subInstanceId: string,
        input?: string
    ): HistoryEvent[] {
        return [
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: true,
                name: orchestratorName,
                input,
            }),
            new SubOrchestrationInstanceCreatedEvent({
                eventId: 0,
                timestamp: firstTimestamp,
                isPlayed: false,
                name: subOrchestratorName,
                input,
                instanceId: subInstanceId,
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
            }),
            new SubOrchestrationInstanceFailedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
                details: "Big stack trace here",
                reason: "Sub orchestrator function 'SayHelloInline' failed: Result: Failure",
                taskScheduledId: 0,
            }),
        ];
    }

    public static GetSayHelloWithSubOrchestratorRetryFailOne(
        firstTimestamp: Date,
        subInstanceId: string,
        input: unknown
    ): HistoryEvent[] {
        return [
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: true,
                name: "SayHelloWithSubOrchestratorRetry",
                input: JSON.stringify(input),
            }),
            new SubOrchestrationInstanceCreatedEvent({
                eventId: 0,
                timestamp: firstTimestamp,
                isPlayed: false,
                name: "SayHelloInline",
                input: JSON.stringify(input),
                instanceId: subInstanceId,
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
            }),
            new SubOrchestrationInstanceFailedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
                details: "Big stack trace here",
                reason: "Sub orchestrator function 'SayHelloInline' failed: Result: Failure",
                taskScheduledId: 0,
            }),
        ];
    }

    public static GetSayHelloWithSubOrchestratorRetryRetryOne(
        firstTimestamp: Date,
        subInstanceId: string,
        input: string,
        retryInterval: number
    ): HistoryEvent[] {
        return [
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: true,
                name: "SayHelloWithSubOrchestratorRetry",
                input,
            }),
            new SubOrchestrationInstanceCreatedEvent({
                eventId: 0,
                timestamp: firstTimestamp,
                isPlayed: false,
                name: "SayHelloInline",
                input,
                instanceId: subInstanceId,
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
            }),
            new SubOrchestrationInstanceFailedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
                details: "Big stack trace here",
                reason: "Sub orchestrator function 'SayHelloInline' failed: Result: Failure",
                taskScheduledId: 0,
            }),
            new TimerCreatedEvent({
                eventId: 1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
                fireAt: moment(firstTimestamp).add(1, "s").add(retryInterval, "ms").toDate(),
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").add(retryInterval, "ms").toDate(),
                isPlayed: false,
            }),
            new TimerFiredEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").add(retryInterval, "ms").toDate(),
                isPlayed: false,
                fireAt: moment(firstTimestamp).add(1, "s").add(retryInterval, "ms").toDate(),
                timerId: 1,
            }),
        ];
    }

    public static GetSayHelloWithSubOrchestratorRetryRetryTwo(
        firstTimestamp: Date,
        subInstanceId: string,
        input: string,
        retryInterval: number
    ): HistoryEvent[] {
        return [
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: true,
                name: "SayHelloWithSubOrchestratorRetry",
                input,
            }),
            new SubOrchestrationInstanceCreatedEvent({
                eventId: 0,
                timestamp: firstTimestamp,
                isPlayed: false,
                name: "SayHelloInline",
                input,
                instanceId: subInstanceId,
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
            }),
            new SubOrchestrationInstanceFailedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
                details: "Big stack trace here",
                reason: "Sub orchestrator function 'SayHelloInline' failed: Result: Failure",
                taskScheduledId: 0,
            }),
            new TimerCreatedEvent({
                eventId: 1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
                fireAt: moment(firstTimestamp).add(1, "s").add(retryInterval, "ms").toDate(),
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(2, "s").add(retryInterval, "ms").toDate(),
                isPlayed: false,
            }),
            new TimerFiredEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(2, "s").add(retryInterval, "ms").toDate(),
                isPlayed: false,
                fireAt: moment(firstTimestamp).add(2, "s").add(retryInterval, "ms").toDate(),
                timerId: 1,
            }),
            new SubOrchestrationInstanceCreatedEvent({
                eventId: 2,
                timestamp: firstTimestamp,
                isPlayed: false,
                name: "SayHelloInline",
                input,
                instanceId: subInstanceId,
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(3, "s").toDate(),
                isPlayed: false,
            }),
            new SubOrchestrationInstanceFailedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(3, "s").toDate(),
                isPlayed: false,
                details: "Big stack trace here",
                reason: "Sub orchestrator function 'SayHelloInline' failed: Result: Failure",
                taskScheduledId: 2,
            }),
            new TimerCreatedEvent({
                eventId: 3,
                timestamp: moment(firstTimestamp).add(3, "s").toDate(),
                isPlayed: false,
                fireAt: moment(firstTimestamp).add(3, "s").add(retryInterval, "ms").toDate(),
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(3, "s").toDate(),
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(4, "s").add(retryInterval, "ms").toDate(),
                isPlayed: false,
            }),
            new TimerFiredEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(4, "s").add(retryInterval, "ms").toDate(),
                isPlayed: false,
                fireAt: moment(firstTimestamp).add(4, "s").add(retryInterval, "ms").toDate(),
                timerId: 3,
            }),
        ];
    }

    public static GetSayHelloWithSuborchestratorRetryFanout(
        firstTimestamp: Date,
        retryInterval: number,
        iteration: number
    ): HistoryEvent[] {
        const instanceIds = [uuidv1(), uuidv1(), uuidv1()];

        const historyEvents: HistoryEvent[] = [];
        if (iteration >= 1) {
            historyEvents.push(
                new OrchestratorStartedEvent({
                    eventId: -1,
                    timestamp: firstTimestamp,
                    isPlayed: iteration > 1,
                })
            );
            historyEvents.push(
                new ExecutionStartedEvent({
                    eventId: -1,
                    timestamp: firstTimestamp,
                    isPlayed: iteration > 1,
                    name: "SayHelloWithSubOrchestratorRetryFanout",
                    input: undefined,
                })
            );
            historyEvents.push(
                new SubOrchestrationInstanceCreatedEvent({
                    eventId: 0,
                    timestamp: firstTimestamp,
                    isPlayed: iteration > 1,
                    name: "SayHelloInline",
                    input: "Tokyo",
                    instanceId: instanceIds[0],
                })
            );
            historyEvents.push(
                new SubOrchestrationInstanceCreatedEvent({
                    eventId: 1,
                    timestamp: firstTimestamp,
                    isPlayed: iteration > 1,
                    name: "SayHelloInline",
                    input: "Seattle",
                    instanceId: instanceIds[1],
                })
            );
            historyEvents.push(
                new OrchestratorCompletedEvent({
                    eventId: -1,
                    timestamp: firstTimestamp,
                    isPlayed: iteration > 1,
                })
            );
        }

        if (iteration >= 2) {
            historyEvents.push(
                new OrchestratorStartedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp).add(110, "ms").toDate(),
                    isPlayed: iteration > 2,
                })
            );
            historyEvents.push(
                new SubOrchestrationInstanceFailedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp).add(100, "ms").toDate(),
                    isPlayed: iteration > 2,
                    taskScheduledId: 0,
                    details: "Big stack trace here",
                    reason: "Activity function 'Hello' failed: Result: Failure",
                    instanceId: instanceIds[0],
                })
            );
            historyEvents.push(
                new SubOrchestrationInstanceCompletedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp)
                        .add(100, "s")
                        .add(retryInterval, "ms")
                        .add(100, "ms")
                        .toDate(),
                    isPlayed: iteration > 2,
                    result: JSON.stringify(`Hello, Seattle!`),
                    taskScheduledId: 1,
                    instanceId: instanceIds[1],
                })
            );
            historyEvents.push(
                new TimerCreatedEvent({
                    eventId: 2,
                    timestamp: moment(firstTimestamp).add(100, "ms").toDate(),
                    isPlayed: iteration > 2,
                    fireAt: moment(firstTimestamp).add(100, "ms").add(retryInterval, "ms").toDate(),
                })
            );
            historyEvents.push(
                new OrchestratorCompletedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp).add(100, "ms").toDate(),
                    isPlayed: iteration > 2,
                })
            );
        }

        if (iteration >= 3) {
            historyEvents.push(
                new OrchestratorStartedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp).add(1, "s").add(retryInterval, "ms").toDate(),
                    isPlayed: iteration > 3,
                })
            );
            historyEvents.push(
                new TimerFiredEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp)
                        .add(100, "ms")
                        .add(retryInterval, "ms")
                        .toDate(),
                    isPlayed: iteration > 3,
                    fireAt: moment(firstTimestamp).add(100, "s").add(retryInterval, "ms").toDate(),
                    timerId: 2,
                })
            );
            historyEvents.push(
                new SubOrchestrationInstanceCreatedEvent({
                    eventId: 3,
                    timestamp: moment(firstTimestamp)
                        .add(100, "ms")
                        .add(retryInterval, "ms")
                        .toDate(),
                    isPlayed: iteration > 3,
                    name: "SayHelloInline",
                    input: "Tokyo",
                    instanceId: instanceIds[2],
                })
            );
            historyEvents.push(
                new OrchestratorCompletedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp).add(100, "ms").toDate(),
                    isPlayed: iteration > 3,
                })
            );
        }

        if (iteration >= 4) {
            historyEvents.push(
                new OrchestratorStartedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp)
                        .add(100, "s")
                        .add(retryInterval, "ms")
                        .add(100, "ms")
                        .toDate(),
                    isPlayed: iteration > 4,
                })
            );
            historyEvents.push(
                new SubOrchestrationInstanceCompletedEvent({
                    eventId: -1,
                    timestamp: moment(firstTimestamp)
                        .add(100, "s")
                        .add(retryInterval, "ms")
                        .add(100, "ms")
                        .toDate(),
                    isPlayed: iteration > 4,
                    result: JSON.stringify(`Hello, Tokyo!`),
                    taskScheduledId: 3,
                    instanceId: instanceIds[2],
                })
            );
        }

        return historyEvents;
    }

    public static GetThrowsExceptionFromActivityReplayOne(firstTimestamp: Date): HistoryEvent[] {
        return [
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: true,
                name: "DoesntHandleExceptionFromActivity",
                input: undefined,
            }),
            new TaskScheduledEvent({
                eventId: 0,
                timestamp: firstTimestamp,
                isPlayed: false,
                name: "ThrowsErrorActivity",
                input: undefined,
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
            }),
            new TaskFailedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
                taskScheduledId: 0,
                details: "Big stack trace here",
                reason: "Activity function 'ThrowsErrorActivity' failed.",
            }),
        ];
    }

    public static GetWaitForExternalEventEventReceived(
        firstTimestamp: Date,
        eventName: string,
        input?: unknown
    ): HistoryEvent[] {
        return [
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: true,
                name: "WaitForExternalEvent",
                input: JSON.stringify(input),
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: false,
            }),
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
            }),
            new EventRaisedEvent({
                eventId: -1,
                timestamp: moment(firstTimestamp).add(1, "s").toDate(),
                isPlayed: false,
                input: JSON.stringify(input),
                name: eventName,
            }),
        ];
    }

    private static TimerCreated(timestamp: Date, fireAt: Date, timerId: number): HistoryEvent[] {
        return [
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp,
                isPlayed: false,
            }),
            new TimerCreatedEvent({
                eventId: timerId,
                timestamp,
                isPlayed: false,
                fireAt,
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp,
                isPlayed: false,
            }),
        ];
    }

    private static TimerFired(fireAt: Date, timerId: number): HistoryEvent[] {
        return [
            new OrchestratorStartedEvent({
                eventId: -1,
                timestamp: fireAt,
                isPlayed: false,
            }),
            new TimerFiredEvent({
                eventId: -1,
                timestamp: fireAt,
                isPlayed: false,
                fireAt,
                timerId,
            }),
            new OrchestratorCompletedEvent({
                eventId: -1,
                timestamp: fireAt,
                isPlayed: false,
            }),
        ];
    }

    public static GetWaitOnTimerFired(
        firstTimestamp: Date,
        fireAt: Date,
        maximumShortTimerDuration: moment.Duration = moment.duration(6, "d"),
        longRunningTimerIntervalDuration: moment.Duration = moment.duration(3, "d")
    ): HistoryEvent[] {
        const history: HistoryEvent[] = [
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: true,
                name: "WaitOnTimer",
                input: JSON.stringify(fireAt),
            }),
        ];

        let previousTimestamp = firstTimestamp;
        let nextFireAt;
        let timerId = 0;
        while (
            moment.duration(moment(fireAt).diff(previousTimestamp)) > maximumShortTimerDuration
        ) {
            nextFireAt = moment(previousTimestamp).add(longRunningTimerIntervalDuration).toDate();
            history.push(
                ...this.TimerCreated(previousTimestamp, nextFireAt, timerId),
                ...this.TimerFired(nextFireAt, timerId)
            );
            previousTimestamp = nextFireAt;
            timerId++;
        }
        history.push(
            ...this.TimerCreated(previousTimestamp, fireAt, timerId),
            ...this.TimerFired(fireAt, timerId)
        );
        return history;
    }

    public static GetWaitOnLongTimerHalfway(
        firstTimestamp: Date,
        fireAt: Date,
        maximumShortTimerDuration: moment.Duration = moment.duration(6, "d"),
        longRunningTimerIntervalDuration: moment.Duration = moment.duration(3, "d")
    ): HistoryEvent[] {
        if (moment.duration(moment(fireAt).diff(firstTimestamp)) < maximumShortTimerDuration) {
            throw new Error("Not a long timer");
        }

        const history: HistoryEvent[] = [
            new ExecutionStartedEvent({
                eventId: -1,
                timestamp: firstTimestamp,
                isPlayed: true,
                name: "WaitOnTimer",
                input: JSON.stringify(fireAt),
            }),
        ];

        const nextFireAt = moment(firstTimestamp).add(longRunningTimerIntervalDuration).toDate();
        history.push(...this.TimerCreated(firstTimestamp, nextFireAt, 0));
        history.push(...this.TimerFired(nextFireAt, 0));
        return history;
    }
}
