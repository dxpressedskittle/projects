use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Universe {
    rows: usize,
    words_per_row: usize,
    cells: Vec<u32>,
    next: Vec<u32>,
}

#[wasm_bindgen]
impl Universe {
    #[wasm_bindgen(constructor)]
    pub fn new(rows: usize, words_per_row: usize) -> Universe {
        let size = rows * words_per_row;
        Universe {
            rows,
            words_per_row,
            cells: vec![0u32; size],
            next: vec![0u32; size],
        }
    }

    pub fn cells_ptr(&self) -> *const u32 {
        self.cells.as_ptr()
    }

    pub fn cells_len(&self) -> usize {
        self.cells.len()
    }

    pub fn tick(&mut self) {
        let w = self.words_per_row;
        self.next.fill(0);

        for ar in 1..self.rows - 1 {
            let row_above = (ar - 1) * w;
            let row_curr  =  ar      * w;
            let row_below = (ar + 1) * w;

            for wi in 0..w {
                // Load 3x3 window of words
                let al = if wi > 0    { self.cells[row_above + wi - 1] } else { 0 };
                let ac =               self.cells[row_above + wi];
                let ar = if wi < w-1  { self.cells[row_above + wi + 1] } else { 0 };

                let cl = if wi > 0    { self.cells[row_curr  + wi - 1] } else { 0 };
                let cc =               self.cells[row_curr  + wi];
                let cr = if wi < w-1  { self.cells[row_curr  + wi + 1] } else { 0 };

                let bl = if wi > 0    { self.cells[row_below + wi - 1] } else { 0 };
                let bc =               self.cells[row_below + wi];
                let br = if wi < w-1  { self.cells[row_below + wi + 1] } else { 0 };

                // Shift each row left/right to align neighbors, bridging word boundaries
                // left-shift = neighbor to the right, right-shift = neighbor to the left
                let above_left  = (ac << 1) | (al >> 31);
                let above_right = (ac >> 1) | (ar << 31);
                let curr_left   = (cc << 1) | (cl >> 31);
                let curr_right  = (cc >> 1) | (cr << 31);
                let below_left  = (bc << 1) | (bl >> 31);
                let below_right = (bc >> 1) | (br << 31);

                // Sum all 8 neighbors as packed 2-bit counters using half-adder trees
                // Each bit position independently counts its 8 neighbors
                let (s0, c0) = half_add(above_left,  ac);
                let (s1, c1) = half_add(above_right, curr_left);
                let (s2, c2) = half_add(cc,          curr_right); // cc = self, used for alive check
                let (s3, c3) = half_add(below_left,  bc);
                let (s4, c4) = half_add(below_right, s2);         // reuse s2

                let (sum0, carry0) = full_add(s0, s1, s3);
                let (sum1, carry1) = full_add(s4, c0, c1);
                let (sum2, carry2) = full_add(c2, c3, c4);

                let (n0, k0) = full_add(sum0, sum1, sum2);
                let (n1, _)  = full_add(carry0, carry1, carry2);
                let n2 = k0 | n1; // overflow bit — if set, count >= 4

                // n0 = bit 0 of neighbor count
                // n1 = bit 1 of neighbor count  
                // n2 = overflow (count >= 4, always dead)
                //
                // Alive if: count == 2 && alive, count == 3 (alive or dead)
                // count == 2: n1=1, n0=0, n2=0
                // count == 3: n1=1, n0=1, n2=0
                let count_is_2 = n1 & !n0 & !n2;
                let count_is_3 = n1 &  n0 & !n2;

                self.next[row_curr + wi] = count_is_3 | (count_is_2 & cc);
            }
        }

        std::mem::swap(&mut self.cells, &mut self.next);
    }
}

// Half adder: returns (sum, carry)
#[inline(always)]
fn half_add(a: u32, b: u32) -> (u32, u32) {
    (a ^ b, a & b)
}

// Full adder: returns (sum, carry)
#[inline(always)]
fn full_add(a: u32, b: u32, c: u32) -> (u32, u32) {
    let s = a ^ b ^ c;
    let k = (a & b) | (b & c) | (a & c);
    (s, k)
}