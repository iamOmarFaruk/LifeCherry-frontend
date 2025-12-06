import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import { HiHome, HiArrowLeft } from 'react-icons/hi2';

// 404 Animation Data - Cherry themed floating elements
const notFoundAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 90,
  w: 400,
  h: 400,
  nm: "404 Animation",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Cherry 1",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, t: 0, s: [0] },
            { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, t: 45, s: [15] },
            { t: 90, s: [0] }
          ]
        },
        p: {
          a: 1,
          k: [
            { i: { x: 0.667, y: 1 }, o: { x: 0.333, y: 0 }, t: 0, s: [100, 150, 0] },
            { i: { x: 0.667, y: 1 }, o: { x: 0.333, y: 0 }, t: 45, s: [100, 130, 0] },
            { t: 90, s: [100, 150, 0] }
          ]
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "el",
          s: { a: 0, k: [30, 30] },
          p: { a: 0, k: [0, 0] },
          nm: "Cherry"
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.9, 0.22, 0.27, 1] },
          o: { a: 0, k: 100 },
          r: 1,
          bm: 0,
          nm: "Fill"
        }
      ],
      ip: 0,
      op: 90,
      st: 0,
      bm: 0
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Cherry 2",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, t: 0, s: [0] },
            { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, t: 45, s: [-15] },
            { t: 90, s: [0] }
          ]
        },
        p: {
          a: 1,
          k: [
            { i: { x: 0.667, y: 1 }, o: { x: 0.333, y: 0 }, t: 0, s: [300, 150, 0] },
            { i: { x: 0.667, y: 1 }, o: { x: 0.333, y: 0 }, t: 45, s: [300, 130, 0] },
            { t: 90, s: [300, 150, 0] }
          ]
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "el",
          s: { a: 0, k: [30, 30] },
          p: { a: 0, k: [0, 0] },
          nm: "Cherry"
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.9, 0.22, 0.27, 1] },
          o: { a: 0, k: 100 },
          r: 1,
          bm: 0,
          nm: "Fill"
        }
      ],
      ip: 0,
      op: 90,
      st: 0,
      bm: 0
    },
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: "4 Left",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: {
          a: 1,
          k: [
            { i: { x: 0.667, y: 1 }, o: { x: 0.333, y: 0 }, t: 0, s: [120, 200, 0] },
            { i: { x: 0.667, y: 1 }, o: { x: 0.333, y: 0 }, t: 45, s: [120, 190, 0] },
            { t: 90, s: [120, 200, 0] }
          ]
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "sh",
              d: 1,
              ks: {
                a: 0,
                k: {
                  i: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
                  v: [[0, -40], [-25, 10], [25, 10], [25, 10], [25, 40]],
                  c: false
                }
              },
              nm: "Path"
            },
            {
              ty: "st",
              c: { a: 0, k: [0.9, 0.22, 0.27, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 12 },
              lc: 2,
              lj: 2,
              bm: 0,
              nm: "Stroke"
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 }
            }
          ],
          nm: "4"
        }
      ],
      ip: 0,
      op: 90,
      st: 0,
      bm: 0
    },
    {
      ddd: 0,
      ind: 4,
      ty: 4,
      nm: "0 Center",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, t: 0, s: [0] },
            { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, t: 30, s: [5] },
            { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, t: 60, s: [-5] },
            { t: 90, s: [0] }
          ]
        },
        p: {
          a: 1,
          k: [
            { i: { x: 0.667, y: 1 }, o: { x: 0.333, y: 0 }, t: 0, s: [200, 200, 0] },
            { i: { x: 0.667, y: 1 }, o: { x: 0.333, y: 0 }, t: 45, s: [200, 185, 0] },
            { t: 90, s: [200, 200, 0] }
          ]
        },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] }, o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] }, t: 0, s: [100, 100, 100] },
            { i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] }, o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] }, t: 45, s: [110, 110, 100] },
            { t: 90, s: [100, 100, 100] }
          ]
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "el",
          s: { a: 0, k: [70, 90] },
          p: { a: 0, k: [0, 0] },
          nm: "0"
        },
        {
          ty: "st",
          c: { a: 0, k: [0.9, 0.22, 0.27, 1] },
          o: { a: 0, k: 100 },
          w: { a: 0, k: 12 },
          lc: 2,
          lj: 2,
          bm: 0,
          nm: "Stroke"
        }
      ],
      ip: 0,
      op: 90,
      st: 0,
      bm: 0
    },
    {
      ddd: 0,
      ind: 5,
      ty: 4,
      nm: "4 Right",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: {
          a: 1,
          k: [
            { i: { x: 0.667, y: 1 }, o: { x: 0.333, y: 0 }, t: 0, s: [280, 200, 0] },
            { i: { x: 0.667, y: 1 }, o: { x: 0.333, y: 0 }, t: 45, s: [280, 190, 0] },
            { t: 90, s: [280, 200, 0] }
          ]
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "sh",
              d: 1,
              ks: {
                a: 0,
                k: {
                  i: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
                  v: [[0, -40], [-25, 10], [25, 10], [25, 10], [25, 40]],
                  c: false
                }
              },
              nm: "Path"
            },
            {
              ty: "st",
              c: { a: 0, k: [0.9, 0.22, 0.27, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 12 },
              lc: 2,
              lj: 2,
              bm: 0,
              nm: "Stroke"
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 }
            }
          ],
          nm: "4"
        }
      ],
      ip: 0,
      op: 90,
      st: 0,
      bm: 0
    },
    {
      ddd: 0,
      ind: 6,
      ty: 4,
      nm: "Leaf 1",
      sr: 1,
      ks: {
        o: { a: 0, k: 80 },
        r: {
          a: 1,
          k: [
            { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, t: 0, s: [-30] },
            { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, t: 45, s: [-20] },
            { t: 90, s: [-30] }
          ]
        },
        p: {
          a: 1,
          k: [
            { i: { x: 0.667, y: 1 }, o: { x: 0.333, y: 0 }, t: 0, s: [80, 300, 0] },
            { i: { x: 0.667, y: 1 }, o: { x: 0.333, y: 0 }, t: 45, s: [85, 290, 0] },
            { t: 90, s: [80, 300, 0] }
          ]
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "el",
          s: { a: 0, k: [15, 25] },
          p: { a: 0, k: [0, 0] },
          nm: "Leaf"
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.72, 0.43, 0.47, 1] },
          o: { a: 0, k: 100 },
          r: 1,
          bm: 0,
          nm: "Fill"
        }
      ],
      ip: 0,
      op: 90,
      st: 0,
      bm: 0
    },
    {
      ddd: 0,
      ind: 7,
      ty: 4,
      nm: "Leaf 2",
      sr: 1,
      ks: {
        o: { a: 0, k: 80 },
        r: {
          a: 1,
          k: [
            { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, t: 0, s: [30] },
            { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, t: 45, s: [20] },
            { t: 90, s: [30] }
          ]
        },
        p: {
          a: 1,
          k: [
            { i: { x: 0.667, y: 1 }, o: { x: 0.333, y: 0 }, t: 0, s: [320, 300, 0] },
            { i: { x: 0.667, y: 1 }, o: { x: 0.333, y: 0 }, t: 45, s: [315, 290, 0] },
            { t: 90, s: [320, 300, 0] }
          ]
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "el",
          s: { a: 0, k: [15, 25] },
          p: { a: 0, k: [0, 0] },
          nm: "Leaf"
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.72, 0.43, 0.47, 1] },
          o: { a: 0, k: 100 },
          r: 1,
          bm: 0,
          nm: "Fill"
        }
      ],
      ip: 0,
      op: 90,
      st: 0,
      bm: 0
    }
  ],
  markers: []
};

const NotFound = () => {
  return (
    <div className="relative min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16 pb-32">
      {/* Main content */}
      <div className="text-center max-w-lg">
        {/* Lottie Animation */}
        <div className="w-64 h-64 mx-auto -mb-4">
          <Lottie 
            animationData={notFoundAnimation} 
            loop={true}
            className="w-full h-full"
          />
        </div>

        {/* Error Text */}
        <h2 className="text-2xl md:text-3xl font-semibold text-text mb-2">
          Page Not Found
        </h2>
        <p className="text-text-secondary text-base mb-8">
          Oops! The page you're looking for seems to have wandered off.<br />
          Don't worry, even the best life lessons sometimes take unexpected turns.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-cherry text-white font-semibold rounded-xl hover:bg-cherry-dark transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <HiHome className="text-xl" />
            Back to Home
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-cherry font-semibold rounded-xl border-2 border-cherry hover:bg-cherry-50 transition-all duration-300"
          >
            <HiArrowLeft className="text-xl" />
            Go Back
          </button>
        </div>
      </div>

      {/* Cherry blossom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none">
        <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M0 100L48 92C96 84 192 68 288 60C384 52 480 52 576 56C672 60 768 68 864 72C960 76 1056 76 1152 72C1248 68 1344 60 1392 56L1440 52V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0Z" 
            fill="#FFEAEA"
          />
        </svg>
      </div>
    </div>
  );
};

export default NotFound;
