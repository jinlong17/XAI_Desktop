---- MODULE sync ----
EXTENDS Naturals, FiniteSets, TLC

(*
Phase 4.8 protocol model for sync-v1.

The model is intentionally finite.  The configuration bounds Devices,
MutationIds, and MaxCommit so TLC can explore short mutation sequences across
2-3 devices.

Mandatory scenarios represented by explicit actions:
1. Device revocation: RevokeDevice
2. New-device join: JoinDevice
3. Concurrent Re-key: BeginRekey / FinishRekey while mutations may be pending
4. Offline replay: QueueOfflineMutation / ReplayPending
5. Full recovery: FullRecovery
6. Duplicate mutation: DuplicateMutation

Known limitation: account_commit_seq is modeled as a single honest global
counter.  This checks monotonic local protocol behavior, but it does not defend
server equivocation where different devices are shown different histories.
*)

CONSTANTS
  Devices,
  MutationIds,
  MaxCommit

VARIABLES
  active,
  revoked,
  joined,
  hasDEK,
  keyEpoch,
  rekeying,
  commitSeq,
  seenCommit,
  pending,
  applied,
  conflictShadow,
  recovered,
  scenarioSeen

vars ==
  << active, revoked, joined, hasDEK, keyEpoch, rekeying, commitSeq,
     seenCommit, pending, applied, conflictShadow, recovered, scenarioSeen >>

Scenarios ==
  { "DeviceRevocation",
    "NewDeviceJoin",
    "ConcurrentRekey",
    "OfflineReplay",
    "FullRecovery",
    "DuplicateMutation" }

MutationRecord ==
  [ device: Devices,
    mutation: MutationIds,
    base: 0..MaxCommit,
    epoch: 0..MaxCommit ]

Init ==
  /\ active = {CHOOSE d \in Devices: TRUE}
  /\ revoked = {}
  /\ joined = active
  /\ hasDEK = [d \in Devices |-> d \in active]
  /\ keyEpoch = 0
  /\ rekeying = FALSE
  /\ commitSeq = 0
  /\ seenCommit = [d \in Devices |-> 0]
  /\ pending = {}
  /\ applied = {}
  /\ conflictShadow = {}
  /\ recovered = {}
  /\ scenarioSeen = {}

TypeOK ==
  /\ active \subseteq Devices
  /\ revoked \subseteq Devices
  /\ joined \subseteq Devices
  /\ recovered \subseteq Devices
  /\ hasDEK \in [Devices -> BOOLEAN]
  /\ keyEpoch \in 0..MaxCommit
  /\ rekeying \in BOOLEAN
  /\ commitSeq \in 0..MaxCommit
  /\ seenCommit \in [Devices -> 0..MaxCommit]
  /\ pending \subseteq MutationRecord
  /\ applied \subseteq MutationIds
  /\ conflictShadow \subseteq MutationRecord
  /\ scenarioSeen \subseteq Scenarios

JoinDevice(d) ==
  /\ d \in Devices \ joined
  /\ joined' = joined \cup {d}
  /\ active' = active \cup {d}
  /\ revoked' = revoked \ {d}
  /\ hasDEK' = [hasDEK EXCEPT ![d] = TRUE]
  /\ seenCommit' = [seenCommit EXCEPT ![d] = commitSeq]
  /\ scenarioSeen' = scenarioSeen \cup {"NewDeviceJoin"}
  /\ UNCHANGED << keyEpoch, rekeying, commitSeq, pending, applied,
                  conflictShadow, recovered >>

RevokeDevice(d) ==
  /\ d \in active
  /\ Cardinality(active) > 1
  /\ active' = active \ {d}
  /\ revoked' = revoked \cup {d}
  /\ hasDEK' = [hasDEK EXCEPT ![d] = FALSE]
  /\ scenarioSeen' = scenarioSeen \cup {"DeviceRevocation"}
  /\ UNCHANGED << joined, keyEpoch, rekeying, commitSeq, seenCommit, pending,
                  applied, conflictShadow, recovered >>

BeginRekey ==
  /\ ~rekeying
  /\ keyEpoch < MaxCommit
  /\ rekeying' = TRUE
  /\ keyEpoch' = keyEpoch + 1
  /\ scenarioSeen' = scenarioSeen \cup {"ConcurrentRekey"}
  /\ UNCHANGED << active, revoked, joined, hasDEK, commitSeq, seenCommit,
                  pending, applied, conflictShadow, recovered >>

FinishRekey ==
  /\ rekeying
  /\ rekeying' = FALSE
  /\ hasDEK' = [d \in Devices |-> IF d \in active THEN TRUE ELSE hasDEK[d]]
  /\ UNCHANGED << active, revoked, joined, keyEpoch, commitSeq, seenCommit,
                  pending, applied, conflictShadow, recovered, scenarioSeen >>

QueueOfflineMutation(d, m) ==
  LET rec == [device |-> d, mutation |-> m, base |-> seenCommit[d], epoch |-> keyEpoch]
  IN
    /\ d \in active
    /\ hasDEK[d]
    /\ m \in MutationIds
    /\ rec \notin pending
    /\ pending' = pending \cup {rec}
    /\ scenarioSeen' = scenarioSeen \cup {"OfflineReplay"}
    /\ UNCHANGED << active, revoked, joined, hasDEK, keyEpoch, rekeying,
                    commitSeq, seenCommit, applied, conflictShadow, recovered >>

ReplayPending(rec) ==
  /\ rec \in pending
  /\ pending' = pending \ {rec}
  /\ IF rec.mutation \in applied
     THEN
       /\ commitSeq' = commitSeq
       /\ applied' = applied
       /\ seenCommit' = seenCommit
       /\ conflictShadow' = conflictShadow
     ELSE
       IF /\ rec.device \in active
          /\ hasDEK[rec.device]
          /\ rec.base = commitSeq
          /\ rec.epoch = keyEpoch
          /\ commitSeq < MaxCommit
       THEN
         /\ commitSeq' = commitSeq + 1
         /\ applied' = applied \cup {rec.mutation}
         /\ seenCommit' = [seenCommit EXCEPT ![rec.device] = commitSeq + 1]
         /\ conflictShadow' = conflictShadow
       ELSE
         /\ commitSeq' = commitSeq
         /\ applied' = applied
         /\ seenCommit' = seenCommit
         /\ conflictShadow' = conflictShadow \cup {rec}
  /\ UNCHANGED << active, revoked, joined, hasDEK, keyEpoch, rekeying,
                  recovered, scenarioSeen >>

DuplicateMutation(d, m) ==
  /\ d \in active
  /\ m \in applied
  /\ scenarioSeen' = scenarioSeen \cup {"DuplicateMutation"}
  /\ UNCHANGED << active, revoked, joined, hasDEK, keyEpoch, rekeying,
                  commitSeq, seenCommit, pending, applied, conflictShadow,
                  recovered >>

FullRecovery(d) ==
  /\ d \in joined
  /\ d \in revoked
  /\ active' = active \cup {d}
  /\ revoked' = revoked \ {d}
  /\ hasDEK' = [hasDEK EXCEPT ![d] = TRUE]
  /\ seenCommit' = [seenCommit EXCEPT ![d] = commitSeq]
  /\ recovered' = recovered \cup {d}
  /\ scenarioSeen' = scenarioSeen \cup {"FullRecovery"}
  /\ UNCHANGED << joined, keyEpoch, rekeying, commitSeq, pending, applied,
                  conflictShadow >>

Next ==
  \/ \E d \in Devices: JoinDevice(d)
  \/ \E d \in Devices: RevokeDevice(d)
  \/ BeginRekey
  \/ FinishRekey
  \/ \E d \in Devices, m \in MutationIds: QueueOfflineMutation(d, m)
  \/ \E rec \in pending: ReplayPending(rec)
  \/ \E d \in Devices, m \in MutationIds: DuplicateMutation(d, m)
  \/ \E d \in Devices: FullRecovery(d)

Spec == Init /\ [][Next]_vars

RevokedNotActive ==
  revoked \cap active = {}

RecoveredDevicesHaveDEK ==
  \A d \in recovered: hasDEK[d]

AppliedAndConflictDisjoint ==
  \A rec \in conflictShadow: rec.mutation \notin applied

PendingDevicesAreKnown ==
  \A rec \in pending: rec.device \in joined

CommitWithinBound ==
  commitSeq \in 0..MaxCommit

NoCommitPastDeviceView ==
  \A d \in Devices: seenCommit[d] <= commitSeq

====
