import type { RawApiUser } from "../../types";

const calculateTotalPoints = (
  matches: Array<{ matchId: number; points: number }>,
): number => {
  return matches.reduce((sum, match) => sum + match.points, 0);
};

export const rawApiUsers: RawApiUser[] = [
  {
    "rno": 1,
    "temname": "Deccan Dominators",
    "points": 0,
    "matches": [
      {
        "matchId": 1,
        "points": 727
      },
      {
        "matchId": 2,
        "points": 229
      },
      {
        "matchId": 3,
        "points": 163.5
      },
      {
        "matchId": 4,
        "points": 120.5
      },
      {
        "matchId": 5,
        "points": 137.5
      },
      {
        "matchId": 6,
        "points": 472
      },
      {
        "matchId": 7,
        "points": 120
      },
      {
        "matchId": 8,
        "points": 107
      },
      {
        "matchId": 9,
        "points": 498
      },
      {
        "matchId": 10,
        "points": 225.5
      },
      {
        "matchId": 11,
        "points": 323.5
      },
      {
        "matchId": 12,
        "points": 65
      },
      {
        "matchId": 13,
        "points": 309.5
      },
      {
        "matchId": 14,
        "points": 268
      },
      {
        "matchId": 15,
        "points": 168
      },
      {
        "matchId": 16,
        "points": 442
      },
      {
        "matchId": 17,
        "points": 407
      },
      {
        "matchId": 18,
        "points": 360
      },
      {
        "matchId": 19,
        "points": 239
      },
      {
        "matchId": 20,
        "points": 368.5
      },
      {
        "matchId": 21,
        "points": 324.5
      },
      {
        "matchId": 22,
        "points": 159
      },
      {
        "matchId": 23,
        "points": 467
      },
      {
        "matchId": 24,
        "points": 95
      },
      {
        "matchId": 25,
        "points": 275
      },
      {
        "matchId": 26,
        "points": 101.5
      }
    ]
  },
  {
    "rno": 2,
    "temname": "Watapi",
    "points": 0,
    "matches": [
      {
        "matchId": 1,
        "points": 535
      },
      {
        "matchId": 2,
        "points": 337.5
      },
      {
        "matchId": 3,
        "points": 165.5
      },
      {
        "matchId": 4,
        "points": 196.5
      },
      {
        "matchId": 5,
        "points": 108.5
      },
      {
        "matchId": 6,
        "points": 141
      },
      {
        "matchId": 7,
        "points": 307
      },
      {
        "matchId": 8,
        "points": 257.5
      },
      {
        "matchId": 9,
        "points": 307
      },
      {
        "matchId": 10,
        "points": 238.5
      },
      {
        "matchId": 11,
        "points": 302.5
      },
      {
        "matchId": 12,
        "points": 65
      },
      {
        "matchId": 13,
        "points": 241
      },
      {
        "matchId": 14,
        "points": 198.5
      },
      {
        "matchId": 15,
        "points": 168
      },
      {
        "matchId": 16,
        "points": 352.5
      },
      {
        "matchId": 17,
        "points": 109
      },
      {
        "matchId": 18,
        "points": 332
      },
      {
        "matchId": 19,
        "points": 282.5
      },
      {
        "matchId": 20,
        "points": 212.5
      },
      {
        "matchId": 21,
        "points": 322.5
      },
      {
        "matchId": 22,
        "points": 305
      },
      {
        "matchId": 23,
        "points": 218
      },
      {
        "matchId": 24,
        "points": 244.5
      },
      {
        "matchId": 25,
        "points": 271.5
      },
      {
        "matchId": 26,
        "points": 77
      }
    ]
  },
  {
    "rno": 3,
    "temname": "SquadSeven9",
    "points": 0,
    "matches": [
      {
        "matchId": 1,
        "points": 295
      },
      {
        "matchId": 2,
        "points": 297
      },
      {
        "matchId": 3,
        "points": 155
      },
      {
        "matchId": 4,
        "points": 252.5
      },
      {
        "matchId": 5,
        "points": 208
      },
      {
        "matchId": 6,
        "points": 217
      },
      {
        "matchId": 7,
        "points": 266
      },
      {
        "matchId": 8,
        "points": 148.5
      },
      {
        "matchId": 9,
        "points": 349
      },
      {
        "matchId": 10,
        "points": 78
      },
      {
        "matchId": 11,
        "points": 179.5
      },
      {
        "matchId": 12,
        "points": 42.5
      },
      {
        "matchId": 13,
        "points": 242
      },
      {
        "matchId": 14,
        "points": 170.5
      },
      {
        "matchId": 15,
        "points": 249
      },
      {
        "matchId": 16,
        "points": 150
      },
      {
        "matchId": 17,
        "points": 263
      },
      {
        "matchId": 18,
        "points": 401
      },
      {
        "matchId": 19,
        "points": 327
      },
      {
        "matchId": 20,
        "points": 264
      },
      {
        "matchId": 21,
        "points": 263.5
      },
      {
        "matchId": 22,
        "points": 161
      },
      {
        "matchId": 23,
        "points": 235
      },
      {
        "matchId": 24,
        "points": 399.5
      },
      {
        "matchId": 25,
        "points": 410.5
      },
      {
        "matchId": 26,
        "points": 111
      }
    ]
  },
  {
    "rno": 4,
    "temname": "VATVAGHOOL XI",
    "points": 0,
    "matches": [
      {
        "matchId": 1,
        "points": 386
      },
      {
        "matchId": 2,
        "points": 401.5
      },
      {
        "matchId": 3,
        "points": 149
      },
      {
        "matchId": 4,
        "points": 296
      },
      {
        "matchId": 5,
        "points": 67.5
      },
      {
        "matchId": 6,
        "points": 296
      },
      {
        "matchId": 7,
        "points": 240.5
      },
      {
        "matchId": 8,
        "points": 221.5
      },
      {
        "matchId": 9,
        "points": 182.5
      },
      {
        "matchId": 10,
        "points": 368.5
      },
      {
        "matchId": 11,
        "points": 107
      },
      {
        "matchId": 12,
        "points": 77
      },
      {
        "matchId": 13,
        "points": -1
      },
      {
        "matchId": 14,
        "points": 226
      },
      {
        "matchId": 15,
        "points": 294.5
      },
      {
        "matchId": 16,
        "points": 319
      },
      {
        "matchId": 17,
        "points": 205.5
      },
      {
        "matchId": 18,
        "points": 572
      },
      {
        "matchId": 19,
        "points": 178
      },
      {
        "matchId": 20,
        "points": 161
      },
      {
        "matchId": 21,
        "points": 48.5
      },
      {
        "matchId": 22,
        "points": 255
      },
      {
        "matchId": 23,
        "points": 279
      },
      {
        "matchId": 24,
        "points": 167.5
      },
      {
        "matchId": 25,
        "points": 189.5
      },
      {
        "matchId": 26,
        "points": 93
      }
    ]
  },
  {
    "rno": 5,
    "temname": "RSAwesome 11",
    "points": 0,
    "matches": [
      {
        "matchId": 1,
        "points": 510
      },
      {
        "matchId": 2,
        "points": 376.5
      },
      {
        "matchId": 3,
        "points": 108
      },
      {
        "matchId": 4,
        "points": 174
      },
      {
        "matchId": 5,
        "points": 162.5
      },
      {
        "matchId": 6,
        "points": 317
      },
      {
        "matchId": 7,
        "points": 203.5
      },
      {
        "matchId": 8,
        "points": 159.5
      },
      {
        "matchId": 9,
        "points": 403
      },
      {
        "matchId": 10,
        "points": 65.5
      },
      {
        "matchId": 11,
        "points": 188
      },
      {
        "matchId": 12,
        "points": 32.5
      },
      {
        "matchId": 13,
        "points": 166
      },
      {
        "matchId": 14,
        "points": 130
      },
      {
        "matchId": 15,
        "points": 181.5
      },
      {
        "matchId": 16,
        "points": 322
      },
      {
        "matchId": 17,
        "points": 219
      },
      {
        "matchId": 18,
        "points": 172
      },
      {
        "matchId": 19,
        "points": 242
      },
      {
        "matchId": 20,
        "points": 328.5
      },
      {
        "matchId": 21,
        "points": 28.5
      },
      {
        "matchId": 22,
        "points": 232
      },
      {
        "matchId": 23,
        "points": 316
      },
      {
        "matchId": 24,
        "points": 258
      },
      {
        "matchId": 25,
        "points": 294
      },
      {
        "matchId": 26,
        "points": 170
      }
    ]
  },
  {
    "rno": 6,
    "temname": "PKs11",
    "points": 0,
    "matches": [
      {
        "matchId": 1,
        "points": 530.5
      },
      {
        "matchId": 2,
        "points": 415.5
      },
      {
        "matchId": 3,
        "points": 241.5
      },
      {
        "matchId": 4,
        "points": 169
      },
      {
        "matchId": 5,
        "points": 47
      },
      {
        "matchId": 6,
        "points": 331
      },
      {
        "matchId": 7,
        "points": 197
      },
      {
        "matchId": 8,
        "points": 99.5
      },
      {
        "matchId": 9,
        "points": 471.5
      },
      {
        "matchId": 10,
        "points": 240
      },
      {
        "matchId": 11,
        "points": 146
      },
      {
        "matchId": 12,
        "points": 35.5
      },
      {
        "matchId": 13,
        "points": 265.5
      },
      {
        "matchId": 14,
        "points": 82
      },
      {
        "matchId": 15,
        "points": 217.5
      },
      {
        "matchId": 16,
        "points": 135.5
      },
      {
        "matchId": 17,
        "points": 188
      },
      {
        "matchId": 18,
        "points": 101.5
      },
      {
        "matchId": 19,
        "points": 155.5
      },
      {
        "matchId": 20,
        "points": 226.5
      },
      {
        "matchId": 21,
        "points": 46
      },
      {
        "matchId": 22,
        "points": 115
      },
      {
        "matchId": 23,
        "points": 297.5
      },
      {
        "matchId": 24,
        "points": 169.5
      },
      {
        "matchId": 25,
        "points": 275
      },
      {
        "matchId": 26,
        "points": 108.5
      }
    ]
  },
  {
    "rno": 7,
    "temname": "Bat Bowl XI",
    "points": 0,
    "matches": [
      {
        "matchId": 1,
        "points": 343
      },
      {
        "matchId": 2,
        "points": 374.5
      },
      {
        "matchId": 3,
        "points": 140.5
      },
      {
        "matchId": 4,
        "points": 242.5
      },
      {
        "matchId": 5,
        "points": 0
      },
      {
        "matchId": 6,
        "points": 175
      },
      {
        "matchId": 7,
        "points": 239
      },
      {
        "matchId": 8,
        "points": 10
      },
      {
        "matchId": 9,
        "points": 277
      },
      {
        "matchId": 10,
        "points": 76
      },
      {
        "matchId": 11,
        "points": 75.5
      },
      {
        "matchId": 12,
        "points": 41.5
      },
      {
        "matchId": 13,
        "points": 114
      },
      {
        "matchId": 14,
        "points": 149.5
      },
      {
        "matchId": 15,
        "points": 78
      },
      {
        "matchId": 16,
        "points": 124
      },
      {
        "matchId": 17,
        "points": 314
      },
      {
        "matchId": 18,
        "points": 40
      },
      {
        "matchId": 19,
        "points": 12
      },
      {
        "matchId": 20,
        "points": 246
      },
      {
        "matchId": 21,
        "points": 206
      },
      {
        "matchId": 22,
        "points": 104
      },
      {
        "matchId": 23,
        "points": 111
      },
      {
        "matchId": 24,
        "points": 460
      },
      {
        "matchId": 25,
        "points": 53
      },
      {
        "matchId": 26,
        "points": 18
      }
    ]
  },
  {
    "rno": 8,
    "temname": "RushS01",
    "points": 0,
    "matches": [
      {
        "matchId": 1,
        "points": 667
      },
      {
        "matchId": 2,
        "points": 257
      },
      {
        "matchId": 3,
        "points": 0
      },
      {
        "matchId": 4,
        "points": 0
      },
      {
        "matchId": 5,
        "points": 0
      },
      {
        "matchId": 6,
        "points": 259
      },
      {
        "matchId": 7,
        "points": 0
      },
      {
        "matchId": 8,
        "points": 206
      },
      {
        "matchId": 9,
        "points": 0
      },
      {
        "matchId": 10,
        "points": 209
      },
      {
        "matchId": 11,
        "points": 268
      },
      {
        "matchId": 12,
        "points": 0
      },
      {
        "matchId": 13,
        "points": 42
      },
      {
        "matchId": 14,
        "points": 0
      },
      {
        "matchId": 15,
        "points": 0
      },
      {
        "matchId": 16,
        "points": 168
      },
      {
        "matchId": 17,
        "points": 66
      },
      {
        "matchId": 18,
        "points": 0
      },
      {
        "matchId": 19,
        "points": 0
      },
      {
        "matchId": 20,
        "points": 289
      },
      {
        "matchId": 21,
        "points": 175
      },
      {
        "matchId": 22,
        "points": 0
      },
      {
        "matchId": 23,
        "points": 207
      },
      {
        "matchId": 24,
        "points": 5
      },
      {
        "matchId": 25,
        "points": 0
      },
      {
        "matchId": 26,
        "points": 22
      }
    ]
  }
]
  .map((user) => ({
    ...user,
    points: calculateTotalPoints(user.matches),
  }));
