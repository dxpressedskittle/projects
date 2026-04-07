#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: Vec<u8>, // 0 for dead, 1 for alive
}

#[wasm_bindgen]
impl Universe {
    pub fn tick(&mut self) {
        let mut next = self.cells.clone();
        for row in 0..self.height {
            for col in 0..self.width {
                let idx = (row * self.width + col) as usize;
                let neighbors = self.count_neighbors(row, col);
                
                next[idx] = match (self.cells[idx], neighbors) {
                    (1, 2) | (1, 3) => 1, // Stay alive
                    (0, 3) => 1,          // Born
                    _ => 0,               // Die
                };
            }
        }
        self.cells = next;
    }
}