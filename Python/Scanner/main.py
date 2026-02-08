import cv2
import cv2 as cv
import imutils
import numpy as np
from imutils.perspective import four_point_transform
from collections import deque




class Scanner:
   """


   Class to store utilitys and main scanner functions, url works with live webcam feeds, video files, IP camera
   streams,and index of a webcam connected to the computer. ([0], [1], [2], ect...). Currently working with ONE camera
   than you need to add using add_camera().




   Methods
   -------


   add_camera() :
   remove_camera() :
   __verify_capture()
   enable_scanner()
   __find_contours()
   __find_rect()
   __draw_rect()






   #############
       TODO

    Implement better camera switching system, currenting using two seperate sets of if statements to check and switch between modes 
    


   """




   def __init__(self, mode):
       """
       :param mode: Current scan mode the Scanner uses


       :var url: url or index of cam
       :var buffer: Frame buffer object to reduce clutter in the main enable_scanner func
       :var frame: frame that's easily accessible throughout the function
       """
       self.url = None
       self.buffer = FrameHandler(max_len=15)
       self.frame = None


       if mode == "qr_scanning_mode" or mode == "document_scanning_mode":
           self.scanner_mode = mode
       else:
           print("Invalid scanning mode, reverting to default (qr_scanning_mode)")
           self.scanner_mode = "qr_scanning_mode"


   def add_camera(self, url):
       """
       Checks if the url will actually open a camera, then checks if there is an active camera linked to the scanner
       :param url: URL of stream/video/camIndex


       """
       camera_verified = self.__verify_capture(url)
       if camera_verified:
           if self.url is None:
               self.url = url
               print(f"Success, camera linked to Scanner: {url}, Scanning mode: {self.scanner_mode}")
           elif not camera_verified:
               print("Please remove the current camera from the scanner before linking another")
       else:
           print(f"Unable to open video source: {url}")


   def __verify_capture(self, url):
       cap = cv.VideoCapture(url)


       if not cap.isOpened():
           cap.release()
           return False
       else:
           cap.release()
           return True




   def remove_camera(self):
       if self.url is not None:
           self.url = None
       else:
           print("There is no camera to remove")


   def enable_scanner(self):
       """
       Function to enable scanner and activate main function. Creates two windows for the document and for main
       scanner. (c to switch scanning modes) It uses the frame buffer to find the least blurry frame in a 15 ms 
       window (to avoid lag) to display the document, while the main scanner window is running at the camera's 
       native frame rate to keep the outline of the document fast and stable.

       


       Variables
       ---------
       :var : cap | videoCapture object to get frames from
       :var : frame | current frame from capture object, ret returns False if there is no frame
       :var : contours | NP array of [x, y] coordinates of contours.(sharp white lines in a grayscale img)
       :var : document_contours | Contours of a rectangle detected in the frame (document)
       :var : contour_img | holds img of contours being drawn onto original frame (to show detection)
       :var : warped_img | holds img that has been warped to a bird's eye view to show the document


       """




       cv.namedWindow("Scanner", cv.WINDOW_NORMAL)
       cv.namedWindow("Document", cv.WINDOW_NORMAL)
       if type(self.url) == "str":
           cap = cv.VideoCapture(self.url, cv2.CAP_FFMPEG) # Uses CAP_FFMPEG for network cameras with a link, and CAP_DSHOW for webcams
       else:
           cap = cv.VideoCapture(self.url, cv2.CAP_DSHOW)


       while True:
           ret, frame = cap.read()
           if not ret:
               print("Error: Connection ended unexpectedly")
               break


           # Immediately detect UI box
           display_frame = frame.copy()
           contours = self.__find_contours(frame)
           current_rect = self.__find_rect(contours)

           # add frame to buffer automatically
           score = self.determine_blurriness(frame)
           self.buffer.add(frame, score)

           if self.scanner_mode == "document_scanning_mode":
               if current_rect is not None:
                   # Draw the box immediately so it follows the paper
                   display_frame = self.__draw_rect(display_frame, current_rect)

                   if self.buffer.is_full(): 
                       best_f = self.buffer.get_best_frame() # finds least blurry frame in 15ms window
                       # Detect one last time on the sharpest frame for the final document
                       best_contours = self.__find_contours(best_f)
                       best_rect = self.__find_rect(best_contours)

                       if best_rect is not None:
                           warped = four_point_transform(best_f, best_rect.reshape(4, 2))
                           cv.imshow("Document", warped)

           elif self.scanner_mode == "qr_scanning_mode":
                   best_qr_img = self.scan_img_for_qr(frame.copy())
                   display_frame = best_qr_img

           cv2.putText(display_frame, self.scanner_mode, (0, 20), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
           cv.imshow("Scanner", display_frame)

           # Check key input once per frame to avoid missed inputs
           key = cv.waitKey(1) & 0xFF

           if key == ord('q'):
               print("Exiting scanner")
               break
           elif key == ord("c"):
               if self.scanner_mode == "qr_scanning_mode":
                   self.swap_scanning_mode("document_scanning_mode")
               elif self.scanner_mode == "document_scanning_mode":
                   self.swap_scanning_mode("qr_scanning_mode")

       cv.destroyAllWindows()
       cap.release()

       return None


   def __find_contours(self, img):
       """
       First the image is gray-scaled to make it a single channel, then blurred to prevent small inaccuracies with the
       edge detection. Then cv.Canny() is used to whiten any sharp corners and findContours takes the lines and returns
       a list of contours. Originally the list of contours aren't always consistent, so imutils is used to normalize
       them.

       :param img: An img to find contours on

       :return: A lst of all contours x and y positions
       """

       if img is None or img.size == 0:
           print("Error: Empty frame received")
           return None

       # 1. Preprocessing: Convert frame to grayscale and reduces noise
       gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
       blurred = cv.GaussianBlur(gray, (5, 5), 0)

       # 2. Edge detection
       edges = cv.Canny(blurred, 50, 150)

       # 3. Find contours from edges (replacing the white in the img with contours)
       # Uses CHAIN_APPROX_SIMPLE to get only the endpoints of the contours, instead of all boundary points
       contours = cv.findContours(edges.copy(), cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
       contours = imutils.grab_contours(contours)

       return contours


   def __find_rect(self, contours):
       """
       This function sorts a list of contours as a np array by area, then loops through the 5 biggest to 
       find a rectangle. If it does this then it returns the 4 points of the rectangle


       :param contours: list of contours in an img


       :return: If there is a rectangle found in the frame it returns the 4 points of it
       """


       contours = sorted(contours, key=cv2.contourArea, reverse=True)[:5] # sorts by area to only look at the 5 biggest contours
       for contour in contours:
           area = cv.contourArea(contour)
           if area > 5000:
               perimeter = cv2.arcLength(contour, True)
               approx = cv2.approxPolyDP(contour, 0.02 * perimeter, True)
               if len(approx) == 4:
                   return approx
       return None  


   def __draw_rect(self, img, contours):
       """
      draws all contours onto an img
       """
       if contours is not None:
           cv2.drawContours(img, [contours], -1, (0,0,255),3) # -1 flag to draw all
       return img


   def read_qr(self, img):
       """
       Reads an image and returns the data from all detected QR codes. It also extracts all useful info and draws boxes
       and text onto detected QR codes

       :param img:
       :return: The data from the qr code, as-well as the bounding box of detected codes
       """

       decode = cv.QRCodeDetector()

       success, data, bbox, _ = decode.detectAndDecodeMulti(img) # _ is the qr code cropped, maybe useful later
       if success:
           return data, bbox
       return None, None


   def draw_qr(self, img, data, points):
       """
       Draws the bounding box of a qr code with the data put over it
       """


       if points is not None:
           for i, bbox in enumerate(points):
               pts = np.array(bbox, dtype=np.int32).reshape((-1, 1, 2)) # Transform to np array to draw lines
               cv2.polylines(img, [pts], True, (0, 255, 0), 2)


               if data[i]:
                   cv2.putText(img, data[i], (int(bbox[0][0]), int(bbox[0][1]) - 10), # Draw the text if it was successfully decoded
                               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
               else:
                   cv2.putText(img, "Unable to decode", (int(bbox[0][0]), int(bbox[0][1]) - 10), # Unable to
                               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
       return img


   def scan_img_for_qr(self, img):
       """
       Simple util for less clutter
       """
       data, points = self.read_qr(img)
       qr_frame = self.draw_qr(img, data, points)


       return qr_frame


   def scan_img_for_document(self,img):
       contours = self.__find_contours(img.copy())  # Find all contours in frame

       document_contours = self.__find_rect(contours)  # Find rectangular contours from lst of contours

       contour_img = self.__draw_rect(img.copy(), document_contours)  # I used img.copy() to avoid stupid errors

       if document_contours is not None:
           warped_img = four_point_transform(img, document_contours.reshape(4, 2)) # Only displays document if detected
           cv.imshow("Document", warped_img)  # Only draw and transform points if document_contours is 4 points
       else:
           pass
       return contour_img


   def swap_scanning_mode(self, mode):
       if mode == "document_scanning_mode":
           self.scanner_mode = mode
       elif mode == "qr_scanning_mode":
           self.scanner_mode = mode


       else:
           print("Error: enter a valid scanning mode")




   def determine_blurriness(self, img):
       """
       Takes in an image and uses two opencv to compute the lapLacian of the image (edge detection) then the variance
       (returns a lower number for blurry imgs and higher for more clear ones).


       :param img:
       :return:
       """
       gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY) # gray out the img first


       laplacian_img = cv.Laplacian(gray, cv.CV_64F)
       variance = laplacian_img.var()


       return variance # returns low for blurry


   def get_stack_blur_variance(self, frames):
       frame_stack = frames
       return [self.determine_blurriness(f) for f in frame_stack]


"""
   def display_error(self, error, msg):
       width, height = 200, 200
       cv.namedWindow(error, cv.WINDOW_NORMAL)


       blank_img = np.ones((height, width,3 ), dtype="uint8") * 255


       cv.putText(blank_img, msg, (0, 20), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,0), 2)


       cv2.imshow(error, blank_img)
       print("done")


       cv2.waitKey(1000)
       cv2.destroyAllWindows()
"""


class FrameHandler:


   def __init__(self, max_len=15):
       self.frames = deque(maxlen=max_len)


   def add(self, frame, score):
       # Store as a tuple
       self.frames.append((score, frame.copy()))


   def get_best_frame(self):
       # max() on a list of tuples compares the first element (the score)
       return max(self.frames, key=lambda x: x[0])[1]


   def is_full(self):
       return len(self.frames) == self.frames.maxlen










scanner = Scanner("document_scanning_mode")
scanner.add_camera(0)
scanner.enable_scanner()

