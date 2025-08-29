;; decentra-study.clar
;; Simple Decentralized Study Notes contract
;; - add-note: stores note metadata (owner, title, description, ipfs-hash, likes, dislikes)
;; - vote-note: records a voter's boolean (true=like, false=dislike) and prevents double-voting
;; - get-note: returns note details
;; - has-voted: checks whether a principal has voted on a note

(define-data-var note-counter uint u0)

(define-map notes
  uint
  {
    owner: principal,
    title: (string-ascii 128),
    description: (string-ascii 512),
    ipfs-hash: (string-ascii 128),
    likes: uint,
    dislikes: uint,
    timestamp: uint
  }
)

;; Votes map indexed by composite key {note-id, voter} -> {vote: bool}
(define-map votes
  { note-id: uint, voter: principal }
  { vote: bool }
)

(define-public (add-note (title (string-ascii 128)) (description (string-ascii 512)) (ipfs-hash (string-ascii 128)))
  (let ((id (+ (var-get note-counter) u1))
        (ts (get-block-info? 'block-height)))
    (var-set note-counter id)
    (map-set notes id
      { owner: tx-sender,
        title: title,
        description: description,
        ipfs-hash: ipfs-hash,
        likes: u0,
        dislikes: u0,
        timestamp: id ;; simple timestamp substitute (Clarinet local)
      })
    (ok id)
  )
)

(define-public (vote-note (note-id uint) (like bool))
  (begin
    (match (map-get? notes note-id)
      note
      (if (map-get? votes { note-id: note-id, voter: tx-sender })
        (err u100) ;; Already voted
        (begin
          (map-set votes { note-id: note-id, voter: tx-sender } { vote: like })
          (if like
            (map-set notes note { likes: (+ (get likes note) u1), dislikes: (get dislikes note) })
            (map-set notes note { likes: (get likes note), dislikes: (+ (get dislikes note) u1) })
          )
          (ok true)
        )
      )
      (err u404) ;; Note not found
    )
  )
)

(define-read-only (get-note (note-id uint))
  (map-get? notes note-id)
)

(define-read-only (has-voted (note-id uint) (user principal))
  (map-get? votes { note-id: note-id, voter: user })
)